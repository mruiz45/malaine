import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseSession } from "@/lib/supabaseSession";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("Handler invoked with method:", req.method);

    // Get the supabase session
    const supabaseSession = await getSupabaseSession(req, res);

    if (!supabaseSession) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // Retrieve the action name from the query parameters
    const actionName = typeof req.query.name === "string" ? req.query.name : "";

    switch (actionName) {
      case "updateItemCoordinates": {
        return updateItemCoordinates(req, res, supabaseSession);
      }
      default:
        res.setHeader("Allow", ["POST", "GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error(`Error in /api/partners/${req.query.name}:`, error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// ------------------------------------------
// Updates the coordinates of an item
// ------------------------------------------
async function updateItemCoordinates(
  req: NextApiRequest,
  res: NextApiResponse,
  supabaseSession: typeof supabaseServer
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { item_id, latitude, longitude } = req.body;

    if (!item_id || !latitude || !longitude) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const itemId = Number(item_id);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: "Invalid item ID format" });
    } 

    const latitudeValue = Number(latitude);
    if (isNaN(latitudeValue)) {
      return res.status(400).json({ error: "Invalid latitude format" });
    }   

    const longitudeValue = Number(longitude);
    if (isNaN(longitudeValue)) {
      return res.status(400).json({ error: "Invalid longitude format" });
    }

    const { data, error } = await supabaseSession
      .from("t_items")
      .update({ latitude: latitudeValue, longitude: longitudeValue })
      .eq("id", itemId);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
    
  } catch (error) {
    console.error("Error updating item coordinates:", error);
  }
} 