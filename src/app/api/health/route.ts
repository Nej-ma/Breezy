import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'breezy-frontend',
    version: process.env.APP_VERSION || '1.0.0'
  })
}