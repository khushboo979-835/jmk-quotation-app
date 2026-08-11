import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/mongodb';
import { Quotation, getNextQuotationNumberMongo } from '../../../models/Quotation';
import { QuotationFormData } from '../../../types/quotation';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const doc = await Quotation.findOne({ quotationNumber: id }).lean();
      if (!doc) {
        return NextResponse.json(
          { success: false, error: `Quotation ${id} not found.` },
          {
            status: 404,
            headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
          }
        );
      }
      const formatted = {
        id: doc.quotationNumber,
        quotationNumber: doc.quotationNumber,
        date: doc.quotationDate,
        buyerName: doc.buyerName,
        buyerGstin: doc.buyerGstin || '',
        totalWeightKg: doc.totalWeightKg,
        subtotal: doc.subtotal,
        taxAmount: doc.taxAmount,
        grandTotal: doc.grandTotal,
        lineItems: doc.lineItems,
        pdfGeneratedAt: doc.createdAt,
        formData: doc.formData
      };
      return NextResponse.json(
        { success: true, quotation: formatted },
        {
          status: 200,
          headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
        }
      );
    }

    const list = await Quotation.find().sort({ createdAt: -1 }).lean();
    
    // Map list to match QuotationRecord interface with date and id fields
    const formatted = list.map((doc: any) => ({
      id: doc.quotationNumber,
      quotationNumber: doc.quotationNumber,
      date: doc.quotationDate,
      buyerName: doc.buyerName,
      buyerGstin: doc.buyerGstin || '',
      totalWeightKg: doc.totalWeightKg,
      subtotal: doc.subtotal,
      taxAmount: doc.taxAmount,
      grandTotal: doc.grandTotal,
      lineItems: doc.lineItems,
      pdfGeneratedAt: doc.createdAt,
      formData: doc.formData
    }));

    return NextResponse.json(
      { success: true, quotations: formatted },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('MongoDB GET quotations error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body: QuotationFormData = await req.json();
    
    if (!body || !body.buyer || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid quotation payload.' },
        {
          status: 400,
          headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
        }
      );
    }

    // Calculations
    const subtotal = Number(body.items.reduce((sum, it) => sum + (it.amount || 0), 0).toFixed(2));
    
    let taxAmount = 0;
    if (body.taxType === 'igst') {
      taxAmount = Number((subtotal * 0.18).toFixed(2));
    } else {
      const cgst = Number((subtotal * 0.09).toFixed(2));
      const sgst = Number((subtotal * 0.09).toFixed(2));
      taxAmount = Number((cgst + sgst).toFixed(2));
    }
    
    const grandTotal = Number((subtotal + taxAmount).toFixed(2));
    const totalWeightKg = Number(body.items.reduce((sum, it) => {
      const qty = it.quantity || 0;
      const unitWt = it.unitWeightKg ?? it.unitWeight ?? 0;
      return sum + (qty * unitWt);
    }, 0).toFixed(2));

    // Auto-generate quotation number if generic or AUTO
    let finalQuotationNumber = body.quotationNumber;
    if (!finalQuotationNumber || finalQuotationNumber.startsWith('Q-') || finalQuotationNumber === 'AUTO') {
      finalQuotationNumber = await getNextQuotationNumberMongo();
    }

    const payloadWithFinalNumber = {
      ...body,
      quotationNumber: finalQuotationNumber
    };

    const record = {
      quotationNumber: finalQuotationNumber,
      quotationDate: body.quotationDate || new Date().toISOString().split('T')[0],
      buyerName: body.buyer?.name || 'Walk-in Customer',
      buyerGstin: body.buyer?.gstin || '',
      contactPerson: body.buyer?.contactPerson || '',
      mobileNumber: body.buyer?.phone || '',
      address: body.buyer?.address || '',
      stateCode: body.buyer?.gstin ? body.buyer.gstin.substring(0, 2) : '10',
      totalWeightKg,
      subtotal,
      taxAmount,
      grandTotal,
      lineItems: body.items,
      formData: payloadWithFinalNumber
    };

    // MongoDB write operation wrapped in a quick try/catch
    let savedDoc;
    try {
      savedDoc = await Quotation.findOneAndUpdate(
        { quotationNumber: finalQuotationNumber },
        {
          $set: record,
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true, new: true }
      );
    } catch (writeError: any) {
      console.error('MongoDB write failed:', writeError);
      return NextResponse.json(
        { success: false, error: 'Database write operation failed: ' + writeError.message },
        {
          status: 500,
          headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
        }
      );
    }

    // Format to match frontend QuotationRecord
    const formattedRecord = {
      id: savedDoc.quotationNumber,
      quotationNumber: savedDoc.quotationNumber,
      date: savedDoc.quotationDate,
      buyerName: savedDoc.buyerName,
      buyerGstin: savedDoc.buyerGstin,
      totalWeightKg: savedDoc.totalWeightKg,
      subtotal: savedDoc.subtotal,
      taxAmount: savedDoc.taxAmount,
      grandTotal: savedDoc.grandTotal,
      lineItems: savedDoc.lineItems,
      pdfGeneratedAt: savedDoc.createdAt,
      formData: savedDoc.formData
    };

    return NextResponse.json(
      { success: true, record: formattedRecord },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('MongoDB POST save quotation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quotation ID is required for deletion.' },
        {
          status: 400,
          headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
        }
      );
    }

    const res = await Quotation.deleteOne({ quotationNumber: id });
    if (res.deletedCount && res.deletedCount > 0) {
      return NextResponse.json(
        { success: true, message: `Quotation ${id} deleted successfully.` },
        {
          status: 200,
          headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
        }
      );
    } else {
      return NextResponse.json(
        { success: false, error: `Quotation ${id} not found.` },
        {
          status: 404,
          headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
        }
      );
    }
  } catch (error: any) {
    console.error('MongoDB DELETE quotation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  }
}
