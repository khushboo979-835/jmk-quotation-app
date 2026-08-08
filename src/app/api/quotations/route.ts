import { NextRequest, NextResponse } from 'next/server';
import { getQuotations, saveQuotation, deleteQuotation } from '../../../lib/db';
import { QuotationFormData } from '../../../types/quotation';

export async function GET(req: NextRequest) {
  try {
    const list = getQuotations();
    return NextResponse.json({ success: true, quotations: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: QuotationFormData = await req.json();
    if (!body || !body.buyer || !body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid quotation payload.' }, { status: 400 });
    }

    const savedRecord = saveQuotation(body);
    return NextResponse.json({ success: true, record: savedRecord });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Quotation ID is required for deletion.' }, { status: 400 });
    }

    const success = deleteQuotation(id);
    if (success) {
      return NextResponse.json({ success: true, message: `Quotation ${id} deleted successfully.` });
    } else {
      return NextResponse.json({ success: false, error: `Quotation ${id} not found.` }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
