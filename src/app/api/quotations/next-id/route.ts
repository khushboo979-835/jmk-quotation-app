import { NextRequest, NextResponse } from 'next/server';
import { getNextQuotationNumber } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    const nextId = getNextQuotationNumber();
    return NextResponse.json({ success: true, nextId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
