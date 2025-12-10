import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Health check endpoint for Docker and monitoring
 */
export async function GET() {
  return NextResponse.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'mind-mate',
    version: process.env.npm_package_version || '0.1.0',
  });
}

