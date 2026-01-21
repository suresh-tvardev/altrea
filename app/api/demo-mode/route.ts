import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enabled } = body;

    const demoModeFile = join(process.cwd(), 'demo_mode.json');
    const data = {
      enabled: enabled === true || enabled === 'true',
      updatedAt: new Date().toISOString(),
    };

    await writeFile(demoModeFile, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: `Demo mode ${data.enabled ? 'enabled' : 'disabled'}` 
    });
  } catch (error) {
    console.error('Error writing demo mode file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to write demo mode file' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { readFile } = await import('fs/promises');
    const demoModeFile = join(process.cwd(), 'demo_mode.json');
    
    try {
      const content = await readFile(demoModeFile, 'utf-8');
      const data = JSON.parse(content);
      return NextResponse.json({ success: true, data });
    } catch {
      // File doesn't exist, return default
      return NextResponse.json({ success: true, data: { enabled: false } });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to read demo mode file' },
      { status: 500 }
    );
  }
}
