/**
 * Stitch Symbols API Route (US_11.5)
 * Handles retrieval of standard stitch symbols for chart generation
 * Follows the established API pattern for the Malaine project
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { 
  StandardStitchSymbol,
  StandardSymbolsResponse,
  StandardSymbolFilters 
} from '@/types/stitchChart';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/stitch-symbols
 * Retrieves standard stitch symbols with optional filtering
 * 
 * Query parameters:
 * - craft_type: Filter by craft type (knitting/crochet)
 * - search: Search in symbol key or description
 * - symbol_keys: Comma-separated list of specific symbol keys
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const filters: StandardSymbolFilters = {
      craft_type: searchParams.get('craft_type') as 'knitting' | 'crochet' | undefined,
      search: searchParams.get('search') || undefined,
      symbol_keys: searchParams.get('symbol_keys')?.split(',').filter(Boolean) || undefined
    };

    // Build the Supabase query
    let query = supabase
      .from('standard_stitch_symbols')
      .select('*');

    // Apply filters
    if (filters.craft_type) {
      query = query.eq('craft_type', filters.craft_type);
    }

    if (filters.search) {
      // Search in both symbol_key and description
      query = query.or(`symbol_key.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.symbol_keys && filters.symbol_keys.length > 0) {
      query = query.in('symbol_key', filters.symbol_keys);
    }

    // Execute query with ordering
    const { data, error, count } = await query
      .order('craft_type')
      .order('symbol_key');

    if (error) {
      console.error('Database error in GET /api/stitch-symbols:', error);
      
      const response: StandardSymbolsResponse = {
        success: false,
        error: 'Failed to fetch standard stitch symbols'
      };
      
      return NextResponse.json(response, { status: 500 });
    }

    // Transform data to match our interface
    const symbols: StandardStitchSymbol[] = (data || []).map(row => ({
      symbol_key: row.symbol_key,
      craft_type: row.craft_type,
      description: row.description,
      graphic_asset_url: row.graphic_asset_url,
      notes: row.notes || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    const response: StandardSymbolsResponse = {
      success: true,
      data: symbols,
      count: symbols.length
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected error in GET /api/stitch-symbols:', error);
    
    const response: StandardSymbolsResponse = {
      success: false,
      error: 'Internal server error'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/stitch-symbols
 * Creates a new standard stitch symbol (admin only)
 * For future admin interface functionality
 */
export async function POST(request: NextRequest) {
  try {
    // For now, return method not allowed since admin interface is not part of US_11.5
    return NextResponse.json(
      { success: false, error: 'Method not implemented in current version' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/stitch-symbols:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 