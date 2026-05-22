import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

    // Check Strapi backend
    const strapiResponse = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    if (!strapiResponse.ok) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          message: 'Strapi backend unreachable',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'healthy',
        message: 'All systems operational',
        timestamp: new Date().toISOString(),
        services: {
          nextjs: 'ok',
          strapi: strapiResponse.ok ? 'ok' : 'error',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
