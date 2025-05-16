import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  // Check if the request is from an admin (you should implement better auth here)
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    // Read the SQL migration file
    const migrationFile = path.join(process.cwd(), 'src', 'auth', 'roles-migration.sql');
    let migrationSql = fs.readFileSync(migrationFile, 'utf8');

    // Split the SQL file into separate statements by semicolons
    const statements = migrationSql.split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    const results = [];
    for (const statement of statements) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement + ';'
        });

        if (error) {
          results.push({ 
            success: false, 
            error: error.message, 
            statement: statement.substring(0, 100) + '...' 
          });
        } else {
          results.push({ 
            success: true, 
            statement: statement.substring(0, 100) + '...' 
          });
        }
      } catch (err) {
        results.push({
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          statement: statement.substring(0, 100) + '...'
        });
      }
    }

    return NextResponse.json({ 
      message: 'Migration executed',
      results
    });
  } catch (err) {
    console.error('Error executing migration:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 