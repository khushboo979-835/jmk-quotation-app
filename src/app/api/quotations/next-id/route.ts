import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/mongodb';
import { getNextQuotationNumberMongo } from '../../../../models/Quotation';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const nextId = await getNextQuotationNumberMongo();
    return NextResponse.json({ success: true, nextId });
  } catch (error: any) {
    console.error('MongoDB next-id GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
