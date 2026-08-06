import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { QuotationFormData } from '../types/quotation';
import { 
  calculateSubtotal, 
  calculateTaxAmounts, 
  getHSNBreakup, 
  calculateItemAmount,
  calculateItemWeight,
  calculateTotalWeight
} from '../utils/calculations';
import { numberToWords } from '../utils/numberToWords';

const styles = StyleSheet.create({
  page: {
    padding: 22.7, // 8mm margin
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    color: '#000000',
    lineHeight: 1.3,
  },
  container: {
    borderWidth: 1,
    borderColor: '#000000',
    flexDirection: 'column',
    flex: 1,
  },
  headerSection: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  companyDetails: {
    width: '60%',
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    textDecoration: 'none',
  },
  companySubtitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
  },
  companyText: {
    fontSize: 7,
    marginTop: 2,
  },
  invoiceDetails: {
    width: '40%',
    padding: 8,
  },
  titleText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 7.5,
    marginBottom: 2,
  },
  metaValue: {
    fontFamily: 'Helvetica-Bold',
  },
  buyerSection: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  buyerBlock: {
    width: '50%',
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  transportBlock: {
    width: '50%',
    padding: 8,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 4,
    textDecoration: 'underline',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    textAlign: 'center',
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    padding: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    minHeight: 20,
    alignItems: 'center',
  },
  tableCell: {
    padding: 4,
    fontSize: 7.5,
  },
  colNo: { width: '5%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000', height: '100%', justifyContent: 'center' },
  colDesc: { width: '43%', borderRightWidth: 1, borderRightColor: '#000000', height: '100%', justifyContent: 'center', paddingLeft: 6 },
  colHsn: { width: '10%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000', height: '100%', justifyContent: 'center' },
  colUnit: { width: '8%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000', height: '100%', justifyContent: 'center' },
  colQty: { width: '8%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000', height: '100%', justifyContent: 'center' },
  colRate: { width: '12%', textAlign: 'right', borderRightWidth: 1, borderRightColor: '#000000', height: '100%', justifyContent: 'center', paddingRight: 4 },
  colAmount: { width: '14%', textAlign: 'right', paddingRight: 4 },
  productLink: {
    color: '#0000ee',
    textDecoration: 'underline',
    fontFamily: 'Helvetica-Bold',
  },
  weightSubtext: {
    fontSize: 6,
    color: '#4b5563',
    marginTop: 1,
  },
  totalsSection: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  wordsBlock: {
    width: '60%',
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  totalsBlock: {
    width: '40%',
    padding: 0,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    backgroundColor: '#f3f4f6',
  },
  grandTotalText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
  },
  hsnSection: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  hsnTable: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000000',
    marginTop: 4,
  },
  hsnRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    alignItems: 'center',
    minHeight: 16,
  },
  hsnHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    textAlign: 'center',
  },
  hsnCol: {
    padding: 3,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  footerSection: {
    flexDirection: 'row',
    marginTop: 'auto',
    minHeight: 80,
  },
  bankBlock: {
    width: '60%',
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  signatoryBlock: {
    width: '40%',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000000',
    width: '80%',
    textAlign: 'center',
    paddingTop: 4,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
  },
});

interface QuotationPDFProps {
  data: QuotationFormData;
}

export const QuotationPDF: React.FC<QuotationPDFProps> = ({ data }) => {
  const { quotationNumber, quotationDate, buyer, items, taxType, bankDetails, authorisedSignatory } = data;

  const subtotal = calculateSubtotal(items);
  const taxes = calculateTaxAmounts(subtotal, taxType);
  const grandTotal = subtotal + taxes.totalTax;
  const hsnBreakup = getHSNBreakup(items, taxType);
  const totalInWords = numberToWords(grandTotal);
  const totalWeight = calculateTotalWeight(items);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header Branding */}
          <View style={styles.headerSection}>
            <View style={styles.companyDetails}>
              <Link src="https://www.indiamart.com/jmkengineeringdevelopers/" style={styles.companyName}>
                JMK ENGINEERING & DEVELOPER
              </Link>
              <Text style={styles.companySubtitle}>Scaffolding, Formwork & Construction Steel Structures</Text>
              <Text style={styles.companyText}>GSTIN: 10AHVPJ9876K1Z9 | PAN: AHVPJ9876K</Text>
              <Text style={styles.companyText}>State: Bihar (Code 10)</Text>
              <Text style={styles.companyText}>Address: Industrial Area, Patna, Bihar - 800013</Text>
            </View>
            <View style={styles.invoiceDetails}>
              <Text style={styles.titleText}>Quotation</Text>
              <Text style={styles.metaText}>Quotation No: <Text style={styles.metaValue}>{quotationNumber}</Text></Text>
              <Text style={styles.metaText}>Date: <Text style={styles.metaValue}>{quotationDate}</Text></Text>
              <Text style={styles.metaText}>PAN: <Text style={styles.metaValue}>AHVPJ9876K</Text></Text>
            </View>
          </View>

          {/* Client & Transport Metadata */}
          <View style={styles.buyerSection}>
            <View style={styles.buyerBlock}>
              <Text style={styles.sectionTitle}>Details of Buyer / Bill to:</Text>
              <Text style={styles.metaText}>Name: <Text style={styles.metaValue}>{buyer.name || 'N/A'}</Text></Text>
              <Text style={styles.metaText}>Address: <Text style={styles.metaValue}>{buyer.address || 'N/A'}</Text></Text>
              {buyer.gstin ? <Text style={styles.metaText}>GSTIN: <Text style={styles.metaValue}>{buyer.gstin}</Text></Text> : null}
              {buyer.phone ? <Text style={styles.metaText}>Phone: <Text style={styles.metaValue}>{buyer.phone}</Text></Text> : null}
              {buyer.email ? <Text style={styles.metaText}>Email: <Text style={styles.metaValue}>{buyer.email}</Text></Text> : null}
            </View>
            <View style={styles.transportBlock}>
              <Text style={styles.sectionTitle}>Transport / Delivery details:</Text>
              <Text style={styles.metaText}>State of Supply: <Text style={styles.metaValue}>
                {buyer.gstin ? (buyer.gstin.substring(0, 2) === '10' ? 'Bihar (10) - Local' : `State Code (${buyer.gstin.substring(0, 2)}) - Interstate`) : 'Bihar (10)'}
              </Text></Text>
              <Text style={styles.metaText}>Tax Mode: <Text style={styles.metaValue}>
                {taxType === 'igst' ? 'IGST (Interstate)' : 'CGST + SGST (Local)'}
              </Text></Text>
              {totalWeight > 0 ? (
                <Text style={styles.metaText}>Total Shipment Weight: <Text style={styles.metaValue}>{totalWeight.toLocaleString('en-IN')} kg</Text></Text>
              ) : null}
            </View>
          </View>

          {/* Description of Goods Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colNo]}>#</Text>
              <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description of Goods</Text>
              <Text style={[styles.tableHeaderCell, styles.colHsn]}>HSN/SAC</Text>
              <Text style={[styles.tableHeaderCell, styles.colUnit]}>Unit</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate (INR)</Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount (INR)</Text>
            </View>

            {items.map((item, index) => {
              const hasWeight = item.unitWeight && item.unitWeight > 0;
              const rowWeight = calculateItemWeight(item);

              return (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colNo]}>{index + 1}</Text>
                  <View style={[styles.tableCell, styles.colDesc]}>
                    {item.photoUrl ? (
                      <Link src={item.photoUrl} style={styles.productLink}>
                        {item.productName}
                      </Link>
                    ) : (
                      <Text style={{ fontFamily: 'Helvetica-Bold' }}>{item.productName}</Text>
                    )}
                    {hasWeight ? (
                      <Text style={styles.weightSubtext}>
                        Unit Weight: {item.unitWeight} kg | Total Weight: {rowWeight} kg
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.tableCell, styles.colHsn]}>{item.hsn}</Text>
                  <Text style={[styles.tableCell, styles.colUnit]}>{item.unit}</Text>
                  <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                  <Text style={[styles.tableCell, styles.colRate]}>INR {item.rate.toFixed(2)}</Text>
                  <Text style={[styles.tableCell, styles.colAmount]}>INR {calculateItemAmount(item).toFixed(2)}</Text>
                </View>
              );
            })}
          </View>

          {/* Totals & Word Representation Block */}
          <View style={styles.totalsSection}>
            <View style={styles.wordsBlock}>
              <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>Amount Chargeable in Words:</Text>
              <Text style={{ fontStyle: 'italic', marginBottom: 6 }}>{totalInWords}</Text>
              {totalWeight > 0 ? (
                <View style={{ borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 4 }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>Total Weight for Logistics: {totalWeight.toLocaleString('en-IN')} kg</Text>
                  <Text style={{ fontSize: 6.5, color: '#4b5563', marginTop: 1 }}>
                    * Transport/Logistics charges are extra based on shipment weight of {totalWeight} kg.
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={styles.totalsBlock}>
              <View style={styles.totalRow}>
                <Text>Subtotal (Taxable Value):</Text>
                <Text>INR {subtotal.toFixed(2)}</Text>
              </View>
              {taxType === 'igst' ? (
                <View style={styles.totalRow}>
                  <Text>IGST @ 18%:</Text>
                  <Text>INR {taxes.igst.toFixed(2)}</Text>
                </View>
              ) : (
                <>
                  <View style={styles.totalRow}>
                    <Text>CGST @ 9%:</Text>
                    <Text>INR {taxes.cgst.toFixed(2)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text>SGST @ 9%:</Text>
                    <Text>INR {taxes.sgst.toFixed(2)}</Text>
                  </View>
                </>
              )}
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalText}>Grand Total:</Text>
                <Text style={styles.grandTotalText}>INR {grandTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* HSN Tax Breakup Summary Matrix */}
          {hsnBreakup.length > 0 ? (
            <View style={styles.hsnSection}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>HSN/SAC wise Tax Breakup Summary:</Text>
              <View style={styles.hsnTable}>
                {taxType === 'igst' ? (
                  <>
                    <View style={styles.hsnHeader}>
                      <Text style={[styles.hsnCol, { width: '20%' }]}>HSN/SAC</Text>
                      <Text style={[styles.hsnCol, { width: '25%', textAlign: 'right' }]}>Taxable Value (INR)</Text>
                      <Text style={[styles.hsnCol, { width: '15%' }]}>IGST Rate</Text>
                      <Text style={[styles.hsnCol, { width: '20%', textAlign: 'right' }]}>IGST Amount (INR)</Text>
                      <Text style={[styles.hsnCol, { width: '20%', textAlign: 'right', borderRightWidth: 0 }]}>Total Tax (INR)</Text>
                    </View>
                    {hsnBreakup.map((row) => (
                      <View key={row.hsn} style={styles.hsnRow}>
                        <Text style={[styles.tableCell, styles.hsnCol, { width: '20%', textAlign: 'center' }]}>{row.hsn}</Text>
                        <Text style={[styles.tableCell, styles.hsnCol, { width: '25%', textAlign: 'right' }]}>INR {row.taxableValue.toFixed(2)}</Text>
                        <Text style={[styles.tableCell, styles.hsnCol, { width: '15%', textAlign: 'center' }]}>{row.igstRate}%</Text>
                        <Text style={[styles.tableCell, styles.hsnCol, { width: '20%', textAlign: 'right' }]}>INR {(row.igstAmount || 0).toFixed(2)}</Text>
                        <Text style={[styles.tableCell, styles.hsnCol, { width: '20%', textAlign: 'right', borderRightWidth: 0 }]}>INR {row.totalTax.toFixed(2)}</Text>
                      </View>
                    ))}
                  </>
                ) : (
                  <>
                    <View style={styles.hsnHeader}>
                      <Text style={[styles.hsnCol, { width: '15%' }]}>HSN/SAC</Text>
                      <Text style={[styles.hsnCol, { width: '25%', textAlign: 'right' }]}>Taxable Value (INR)</Text>
                      <Text style={[styles.hsnCol, { width: '20%', textAlign: 'right' }]}>CGST (9%) (INR)</Text>
                      <Text style={[styles.hsnCol, { width: '20%', textAlign: 'right' }]}>SGST (9%) (INR)</Text>
                      <Text style={[styles.hsnCol, { width: '20%', textAlign: 'right', borderRightWidth: 0 }]}>Total Tax (INR)</Text>
                    </View>
                    {hsnBreakup.map((row) => (
                      <View key={row.hsn} style={styles.hsnRow}>
                        <Text style={[styles.tableCell, styles.hsnCol, { width: '15%', textAlign: 'center' }]}>{row.hsn}</Text>
                        <Text style={[styles.tableCell, styles.hsnCol, { width: '25%', textAlign: 'right' }]}>INR {row.taxableValue.toFixed(2)}</Text>
                        <Text style={[styles.tableCell, styles.hsnCol, { width: '20%', textAlign: 'right' }]}>INR {(row.cgstAmount || 0).toFixed(2)}</Text>
                        <Text style={[styles.tableCell, styles.hsnCol, { width: '20%', textAlign: 'right' }]}>INR {(row.sgstAmount || 0).toFixed(2)}</Text>
                        <Text style={[styles.tableCell, styles.hsnCol, { width: '20%', textAlign: 'right', borderRightWidth: 0 }]}>INR {row.totalTax.toFixed(2)}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            </View>
          ) : null}

          {/* Footer Bank & Signature Block */}
          <View style={styles.footerSection}>
            <View style={styles.bankBlock}>
              <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>JMK Company Bank Details:</Text>
              <Text>Bank Name: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{bankDetails.bankName}</Text></Text>
              <Text>Account No: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{bankDetails.accountNumber}</Text></Text>
              <Text>IFSC Code: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{bankDetails.ifsc}</Text></Text>
              <Text>PAN: <Text style={{ fontFamily: 'Helvetica-Bold' }}>AHVPJ9876K</Text></Text>
              <Text>GSTIN: <Text style={{ fontFamily: 'Helvetica-Bold' }}>10AHVPJ9876K1Z9</Text></Text>
            </View>
            <View style={styles.signatoryBlock}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>For {authorisedSignatory}</Text>
              <Text style={styles.signatureLine}>Authorised Signatory</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default QuotationPDF;
