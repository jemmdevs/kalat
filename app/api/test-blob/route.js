import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Log environment variables (sanitized)
    const blobTokenPrefix = process.env.BLOB_READ_WRITE_TOKEN 
      ? process.env.BLOB_READ_WRITE_TOKEN.substring(0, 10) + '...'
      : 'undefined';

    const envInfo = {
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      blobTokenPrefix,
      nodeEnv: process.env.NODE_ENV,
    };

    return NextResponse.json({ 
      message: 'Vercel Blob test endpoint',
      environment: envInfo
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 