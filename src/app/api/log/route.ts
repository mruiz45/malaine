import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, appendFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { LogApiRequest, LogApiResponse, LogEntry } from '@/types/logging';
import { validateLogEntry, safeStringify } from '@/utils/logger';

/**
 * Directory where log files are stored
 */
const LOGS_DIR = path.join(process.cwd(), 'logs');

/**
 * Path to the pattern design log file
 */
const PATTERN_DESIGN_LOG_FILE = path.join(LOGS_DIR, 'pattern-design.log');

/**
 * Maximum log file size before rotation (10MB)
 */
const MAX_LOG_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Ensures the logs directory exists
 */
async function ensureLogsDirectory(): Promise<void> {
  try {
    if (!existsSync(LOGS_DIR)) {
      await mkdir(LOGS_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Failed to create logs directory:', error);
    throw new Error('Unable to initialize logging directory');
  }
}

/**
 * Rotates the log file if it exceeds the maximum size
 */
async function rotateLogFileIfNeeded(): Promise<void> {
  try {
    if (existsSync(PATTERN_DESIGN_LOG_FILE)) {
      const stats = await import('fs').then(fs => fs.promises.stat(PATTERN_DESIGN_LOG_FILE));
      
      if (stats.size > MAX_LOG_FILE_SIZE) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFile = path.join(LOGS_DIR, `pattern-design-${timestamp}.log`);
        
        // Move current log to rotated file
        await import('fs').then(fs => fs.promises.rename(PATTERN_DESIGN_LOG_FILE, rotatedFile));
        
        console.log(`Log file rotated to: ${rotatedFile}`);
      }
    }
  } catch (error) {
    console.error('Error during log rotation:', error);
    // Continue without rotation rather than failing
  }
}

/**
 * Formats a log entry for file output
 * @param logEntry - Log entry to format
 * @returns Formatted log string
 */
function formatLogEntry(logEntry: LogEntry): string {
  try {
    const logString = safeStringify(logEntry);
    return `${logString}\n`;
  } catch (error) {
    // Fallback formatting if JSON serialization fails
    return `{"timestamp":"${logEntry.timestamp}","level":"${logEntry.level}","event":"${logEntry.event}","error":"Serialization failed","details":{}}\n`;
  }
}

/**
 * Writes log entries to the pattern design log file
 * @param logEntries - Array of log entries to write
 */
async function writeLogsToFile(logEntries: LogEntry[]): Promise<void> {
  try {
    await ensureLogsDirectory();
    await rotateLogFileIfNeeded();
    
    const logLines = logEntries
      .filter(validateLogEntry)
      .map(formatLogEntry)
      .join('');
    
    if (logLines) {
      await appendFile(PATTERN_DESIGN_LOG_FILE, logLines, 'utf8');
    }
  } catch (error) {
    console.error('Failed to write logs to file:', error);
    throw new Error('Unable to persist logs to file system');
  }
}

/**
 * Validates the request payload
 * @param body - Request body
 * @returns True if valid
 */
function validateRequestPayload(body: any): body is LogApiRequest {
  return (
    body &&
    typeof body === 'object' &&
    Array.isArray(body.logs) &&
    body.logs.length > 0
  );
}

/**
 * POST /api/log
 * Receives log entries from the client and writes them to pattern-design.log
 */
export async function POST(request: NextRequest): Promise<NextResponse<LogApiResponse>> {
  try {
    // Parse request body
    let body: any;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    // Validate payload structure
    if (!validateRequestPayload(body)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request payload. Expected { logs: LogEntry[] }',
        },
        { status: 400 }
      );
    }

    const { logs } = body as LogApiRequest;

    // Validate individual log entries
    const validLogs = logs.filter(log => {
      const isValid = validateLogEntry(log);
      if (!isValid) {
        console.warn('Invalid log entry received:', log);
      }
      return isValid;
    });

    if (validLogs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No valid log entries found in request',
        },
        { status: 400 }
      );
    }

    // Add server-side metadata to logs
    const enrichedLogs = validLogs.map(log => ({
      ...log,
      serverTimestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
    }));

    // Write logs to file
    await writeLogsToFile(enrichedLogs);

    // Log successful processing to console for debugging
    console.log(`Processed ${enrichedLogs.length} log entries for pattern design`);

    return NextResponse.json({
      success: true,
      message: 'Logs processed successfully',
      logsProcessed: enrichedLogs.length,
    });

  } catch (error) {
    console.error('Error processing log request:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error while processing logs',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/log
 * Returns information about the logging system (for debugging/monitoring)
 */
export async function GET(): Promise<NextResponse> {
  try {
    await ensureLogsDirectory();
    
    const logFileExists = existsSync(PATTERN_DESIGN_LOG_FILE);
    let logFileSize = 0;
    let lastModified: string | null = null;
    
    if (logFileExists) {
      try {
        const stats = await import('fs').then(fs => fs.promises.stat(PATTERN_DESIGN_LOG_FILE));
        logFileSize = stats.size;
        lastModified = stats.mtime.toISOString();
      } catch (error) {
        console.error('Error getting log file stats:', error);
      }
    }
    
    return NextResponse.json({
      status: 'healthy',
      logFile: {
        exists: logFileExists,
        path: PATTERN_DESIGN_LOG_FILE,
        size: logFileSize,
        lastModified,
        maxSize: MAX_LOG_FILE_SIZE,
      },
      logsDirectory: LOGS_DIR,
    });
    
  } catch (error) {
    console.error('Error in log status check:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Unable to check logging system status',
      },
      { status: 500 }
    );
  }
} 