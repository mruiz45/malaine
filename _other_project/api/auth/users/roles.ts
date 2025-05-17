import { getSupabaseSession } from "@/lib/supabaseSession";
import { NextApiRequest, NextApiResponse } from "next";

// Interface for UserPhysicalRole
interface UserPhysicalRole {
  id: number;
  user_id: number;
  partner_id: number | null;
  site_id: number | null;
  role_type: string;
  role_name: string;
  status: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

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
      return getUserRoles(req, res, supabaseSession);
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

/**
 * Gets user roles by first querying the user_id from t_user using user_uuid,
 * then fetching the roles from t_user_roles.
 * 
 * @param req - The Next.js API request
 * @param res - The Next.js API response
 * @param supabase - The Supabase client instance
 * @returns A response with the user's roles or an error
 */
async function getUserRoles(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  const { user_uuid } = req.query;
  
  if (!user_uuid || typeof user_uuid !== 'string') {
    return res.status(400).json({ error: "user_uuid parameter is required and must be a string" });
  }
  
  try {
    // Step 1: Get the user_id from t_user table using user_uuid
    const { data: userData, error: userError } = await supabase
      .from('t_user')
      .select('user_id')
      .eq('user_uuid', user_uuid)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return res.status(500).json({ error: `Error fetching user: ${userError.message}` });
    }
    
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const userId = userData.user_id;
    
    // Step 2: Get the roles from t_user_roles using the user_id
    const { data: rolesData, error: rolesError } = await supabase
      .from('t_user_roles')
      .select('*')
      .eq('user_id', userId);
    
    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      return res.status(500).json({ error: `Error fetching roles: ${rolesError.message}` });
    }
    
    // Return the roles wrapped in a data property to match the expected format in the client
    return res.status(200).json({ data: rolesData || [] });
  } catch (error: any) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}