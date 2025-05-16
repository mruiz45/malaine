import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/lib/supabaseServer";
import { parse } from "cookie";
import { getSupabaseSession } from "@/lib/supabaseSession";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the supabase session
  const supabaseSession = await getSupabaseSession(req, res);

  if (!supabaseSession) {
    return res.status(401).json({ error: "Not authorized" });
  }

  switch (req.method) {
    case "GET":
      return getItemInfo(req, res, supabaseSession);
    case "POST":
      return createItem(req, res, supabaseSession);
    case "PUT":
      return updateItem(req, res, supabaseSession);
    case "DELETE":
      return deleteItem(req, res, supabaseSession);
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Retrieves the item information
async function getItemInfo(
  req: NextApiRequest,
  res: NextApiResponse,
  supabaseSession: typeof supabaseServer
) {
  try {
    // Fetch site_id from query
    let { id } = req.query;

    let query = supabaseSession
      .from("t_items")
      .select(
        "id, partner_id, name, template, status, latitude, longitude, reference"
      )
      .eq("id", id);

    const { data, error: fetchError } = await query;

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }
    return res.status(200).json({ data });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database Error" });
  }
}

// --------------------------------------
// Creates a new item
// --------------------------------------
async function createItem(
  req: NextApiRequest,
  res: NextApiResponse,
  supabaseSession: typeof supabaseServer
) {
  try {
    const {
      partner_id,
      name,
      template,
      status,
      latitude,
      longitude,
      reference,
    } = req.body;

    // Prepare the body for the Edge Function
    const edgeFunctionBody = {
      action: "create_item",
      data: {
        partner_id,
        name,
        template,
        status,
        latitude,
        longitude,
        reference,
      },
    };

    const cookies = parse(req.headers.cookie || "");
    const accessToken = cookies["access_token"];

    // Call the Edge Function
    const efResponse = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/ef_admin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(edgeFunctionBody),
      }
    );

    const efData = await efResponse.json();

    if (efData.status === "OK") {
      return res.status(200).json({
        id: efData.data.id,
        name: efData.data.name,
      });
    } else {
      return res.status(400).json({ error: efData.data.message });
    }
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database Error" });
  }
}

// Updates a site item
async function updateItem(
  req: NextApiRequest,
  res: NextApiResponse,
  supabaseSession: typeof supabaseServer
) {
  try {
    let { id } = req.query;

    const {
      partner_id,
      name,
      template,
      status,
      latitude,
      longitude,
      reference,
      section_id,
    } = req.body;

    const { data: updatedItem, error: updateError } = await supabaseSession
      .from("t_items")
      .update({
        name,
        template,
        status,
        latitude,
        longitude,
        reference,
        section_id,
      })
      .eq("id", id)
      .eq("partner_id", partner_id)
      .select();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database Error" });
  }
}

// Deletes an item
async function deleteItem(
  req: NextApiRequest,
  res: NextApiResponse,
  supabaseSession: typeof supabaseServer
) {
  try {
    let { id } = req.query;

    const { data, error: rpcError } = await supabaseSession.rpc(
      "delete_item",
      {
        p_id: id,
      }
    );

    if (rpcError) {
      return res.status(400).json({ error: rpcError.message });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database Error" });
  }
}