import { supabaseServer } from "@/lib/supabaseServer";
import { getSupabaseSession } from "@/lib/supabaseSession";
import { parse } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";

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
    case "POST":
      return createUser(req, res);
    case "PUT":
      return updateUser(req, res, supabaseSession);
    default:
      res.setHeader("Allow", ["POST", "PUT"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

/// ------------------------------------------------------------------
/// Creates a user
/// ------------------------------------------------------------------
async function createUser(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;
  if (action === "create_for_partner") {
    return handleCreateUserForPartner(req, res);
  } else if (action === "create_for_site") {
    return handleCreateUserForSite(req, res);
  } else if (action === "create_for_system") {
    return handleCreateUserForSystem(req, res);
  }

  res.status(405).end(`action ${action} Not Allowed`);
}

/// ------------------------------------------------------------------
/// Updates a user
/// ------------------------------------------------------------------
async function updateUser(
  req: NextApiRequest,
  res: NextApiResponse,
  supabaseSession: typeof supabaseServer
) {
  const { action } = req.query;
  if (action === "update_for_partner") {
    return handleUpdateUserForPartner(req, res);
  } else if (action === "update_for_site") {
    return handleUpdateUserForSite(req, res);
  } else if (action === "update_for_system") {
    return handleUpdateUserForSystem(req, res, supabaseSession);
  }

  res.status(405).end(`action ${action} Not Allowed`);
}

/// ------------------------------------------------------------------
/// Creates a user for the system
/// ------------------------------------------------------------------
async function handleCreateUserForSystem(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const {
      email,
      first_name,
      last_name,
      language,
      phone,
      role_name,
      status,
      password,
    } = req.body;

    let payload: any = {
      email,
      first_name,
      last_name,
      language,
      phone,
      role_type: "system",
      role_name,
      status,
      password,
    };

    return handleCreateOrUpdateUserEdgeFunction(
      req,
      res,
      "create_user",
      payload
    );
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database Error" });
  }
}

/// ------------------------------------------------------------------
/// Creates a user for the partner
/// ------------------------------------------------------------------
async function handleCreateUserForPartner(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const {
      partner_id,
      email,
      first_name,
      last_name,
      phone,
      role_name,
      role_status,
    } = req.body;

    let payload: any = {
      partner_id,
      email,
      first_name,
      last_name,
      phone,
      role_type: "partner",
      role_name,
      status: role_status,
    };

    return handleCreateOrUpdateUserEdgeFunction(
      req,
      res,
      "create_partner_user",
      payload
    );
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database Error" });
  }
}

/// ------------------------------------------------------------------
/// Creates a user for the site
/// ------------------------------------------------------------------
async function handleCreateUserForSite(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const {
      partner_id,
      site_id,
      email,
      first_name,
      last_name,
      phone,
      role_name,
      role_status,
    } = req.body;

    let payload: any = {
      partner_id,
      site_id,
      email,
      first_name,
      last_name,
      phone,
      role_type: "site",
      role_name,
      status: role_status,
    };

    return handleCreateOrUpdateUserEdgeFunction(
      req,
      res,
      "create_site_user",
      payload
    );
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database Error" });
  }
}

/// ------------------------------------------------------------------
/// Updates a user for the system
/// ------------------------------------------------------------------
async function handleUpdateUserForSystem(
  req: NextApiRequest,
  res: NextApiResponse,
  supabaseSession: typeof supabaseServer
) {
  try {
    // Déstructuration complète du body pour correspondre exactement aux données reçues
    const { 
      user_id, 
      first_name, 
      last_name, 
      email,
      phone, 
      status, 
      role_name,
      joined_date,
    } = req.body;

    const { data: updatedUser, error: updateError } = await supabaseSession
      .from("t_user")
      .update({
        first_name,
        last_name,
        phone,
        status,
        role_name,  
      })
      .eq("user_id", user_id)
      .select();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }
    console.log("updatedUser", updatedUser);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database Error" });
  }
}

/// ------------------------------------------------------------------
/// Updates a user for the partner
/// ------------------------------------------------------------------
async function handleUpdateUserForPartner(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const {
      user_id,
      partner_id,
      email,
      first_name,
      last_name,
      phone,
      role_name,
      role_status,
    } = req.body;

    let payload: any = {
      user_id,
      partner_id,
      email,
      first_name,
      last_name,
      phone,
      role_type: "partner",
      role_name,
      status: role_status,
    };

    return handleCreateOrUpdateUserEdgeFunction(
      req,
      res,
      "update_partner_user",
      payload
    );
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database Error" });
  }
}

/// ------------------------------------------------------------------
/// Updates a user for the site
/// ------------------------------------------------------------------
async function handleUpdateUserForSite(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const {
      user_id,
      partner_id,
      site_id,
      email,
      first_name,
      last_name,
      phone,
      role_name,
      role_status,
    } = req.body;

    let payload: any = {
      user_id,
      partner_id,
      site_id,
      email,
      first_name,
      last_name,
      phone,
      role_type: "site",
      role_name,
      status: role_status,
    };

    return handleCreateOrUpdateUserEdgeFunction(
      req,
      res,
      "update_site_user",
      payload
    );
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database Error" });
  }
}

/// ------------------------------------------------------------------
/// General routine for user creation/update via Edge Function
/// ------------------------------------------------------------------
async function handleCreateOrUpdateUserEdgeFunction(
  req: NextApiRequest,
  res: NextApiResponse,
  functionName: string,
  payload: any
) {
  try {
    // Prepare the body for the Edge Function
    const edgeFunctionBody = {
      action: functionName,
      data: payload,
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
        user_id: efData.data.user_id,
        password: efData.data.password,
      });
    } else {
      return res.status(400).json({ error: efData.data.message });
    }
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database Error" });
  }
}