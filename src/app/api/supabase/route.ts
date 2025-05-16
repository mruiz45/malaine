import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// Cette API permet de relayer les requêtes vers Supabase en utilisant les clés serveur
// et en cachant les informations sensibles au navigateur

export async function POST(request: Request) {
  try {
    // Récupérer les cookies d'authentification depuis les headers
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const accessToken = cookies['sb-access-token'];
    const refreshToken = cookies['sb-refresh-token'];

    // Vérifier l'authentification
    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Récupérer les paramètres de la requête
    const { table, method, params } = await request.json();

    // Vérifier les paramètres requis
    if (!table || !method) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Définir la session Supabase avec les tokens
    await supabaseServer.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Exécuter la requête Supabase en fonction de la méthode
    let result;
    
    switch (method) {
      case 'select':
        result = await supabaseServer
          .from(table)
          .select(params?.columns || '*')
          .order(params?.orderBy || 'id', { ascending: params?.ascending !== false })
          .range(params?.start || 0, params?.end || 9);
        break;
        
      case 'insert':
        result = await supabaseServer
          .from(table)
          .insert(params?.data || {});
        break;
        
      case 'update':
        result = await supabaseServer
          .from(table)
          .update(params?.data || {})
          .match(params?.match || {});
        break;
        
      case 'delete':
        result = await supabaseServer
          .from(table)
          .delete()
          .match(params?.match || {});
        break;
        
      case 'get':
        result = await supabaseServer
          .from(table)
          .select(params?.columns || '*')
          .match(params?.match || {})
          .single();
        break;
        
      default:
        return NextResponse.json(
          { error: "Invalid method" },
          { status: 400 }
        );
    }

    // Retourner le résultat
    return NextResponse.json(result);
  } catch (error) {
    console.error("Supabase API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 