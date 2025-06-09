import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionApi } from '@/lib/getSupabaseSession';

interface RegionData {
  region_key: string;
  region_name: string;
  available_demographics: string[];
}

interface RegionsResponse {
  success: boolean;
  data: RegionData[];
  error?: string;
}

export async function GET(req: NextRequest): Promise<NextResponse<RegionsResponse>> {
  try {
    // 1. Check HTTP method (déjà géré par la route GET)
    
    // 2. Get session (MANDATORY for auth routes)
    const sessionInfo = await getSupabaseSessionApi(req);
    if (!sessionInfo) {
      return NextResponse.json(
        { success: false, error: 'Not authorized', data: [] },
        { status: 401 }
      );
    }

    const { supabase } = sessionInfo;

    // 3. Perform operations - récupération des régions et démographies disponibles depuis la base de données
    const { data: regionsData, error: regionsError } = await supabase
      .from('size_standards')
      .select('region, demographic')
      .order('region')
      .order('demographic');

    if (regionsError) {
      console.error('Error fetching regions data:', regionsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch regions data', data: [] },
        { status: 500 }
      );
    }

    if (!regionsData || regionsData.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Grouper par région et collecter les démographies disponibles
    const regionMap = new Map<string, Set<string>>();
    
    regionsData.forEach(({ region, demographic }) => {
      if (!regionMap.has(region)) {
        regionMap.set(region, new Set());
      }
      regionMap.get(region)!.add(demographic);
    });

    // Conversion en format de réponse avec noms traduits
    const regionNames: Record<string, string> = {
      'europe': 'Europe',
      'us': 'United States',
      'uk': 'United Kingdom', 
      'asia': 'Asia'
    };

    const responseData: RegionData[] = Array.from(regionMap.entries()).map(([region, demographics]) => ({
      region_key: region,
      region_name: regionNames[region] || region,
      available_demographics: Array.from(demographics).sort()
    }));

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error in /api/size-standards/regions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', data: [] },
      { status: 500 }
    );
  }
} 