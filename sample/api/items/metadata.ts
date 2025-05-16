import { supabaseServer } from "@/lib/supabaseServer";
import { getSupabaseSession } from "@/lib/supabaseSession";
import { NextApiRequest, NextApiResponse } from "next";

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
      return getMetadata(req, res, supabaseSession);
    case "POST":
      return saveMetadata(req, res, supabaseSession);
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// --------------------------------------
// Retrieves the metadata for a site item
// in ALL languages
// --------------------------------------
async function getMetadata(
  req: NextApiRequest,
  res: NextApiResponse,
  supabaseSession: typeof supabaseServer
) {
  try {
    // Fetch site item id for which to retrieve metadata
    let { id } = req.query;

    const { data, error } = await supabaseSession
      .from("t_item_details")
      .select("language, metadata")
      .eq("item_id", id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database Error" });
  }
}

// --------------------------------------
// Saves the metadata for a site item
// in a specific language
// --------------------------------------
async function saveMetadata(
  req: NextApiRequest,
  res: NextApiResponse,
  supabaseSession: typeof supabaseServer
) {
  try {
    const { id, metadata, language, template } = req.body;

    const { data: updatedItem, error: updateError } = await supabaseSession
      .from("t_item_details")
      .update({
        metadata,
      })
      .eq("item_id", id)
      .eq("language", language);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Update the template for the item
    await supabaseSession
      .from("t_items")
      .update({
        template,
      })
      .eq("id", id);
      
    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database Error" });
  }
}