import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';

// For static export, we'll just return a message
export function GET() {
  return NextResponse.json({ 
    message: "This is a static export. PDF downloads are not available in the demo version."
  });
}

export function POST() {
  return NextResponse.json({ 
    message: "This is a static export. PDF downloads are not available in the demo version."
  });
} 