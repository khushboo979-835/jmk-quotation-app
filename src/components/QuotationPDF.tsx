import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, Svg, Path, Rect, Circle } from '@react-pdf/renderer';
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
import { getStateFromGSTIN } from '../utils/gstLookup';

const styles = StyleSheet.create({
  page: {
    padding: 22.7, // 8mm margin
    fontFamily: 'Helvetica',
    fontSize: 7.2,
    color: '#000000',
    lineHeight: 1.3,
  },
  container: {
    borderWidth: 1,
    borderColor: '#000000',
    flexDirection: 'column',
    flex: 1,
  },
  // Tally layout header section
  headerSection: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    height: 168,
  },
  leftHeaderColumn: {
    width: '50%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    height: '100%',
    flexDirection: 'column',
  },
  rightHeaderColumn: {
    width: '50%',
    height: '100%',
    flexDirection: 'column',
  },
  // Top left: Company Details block
  companyBlock: {
    height: 88,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    flexDirection: 'row',
  },
  logoBlock: {
    width: 75,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f4', // Sand/stone colored light background
  },
  companyDetailsBlock: {
    flex: 1,
    padding: 5,
    justifyContent: 'center',
  },
  companyName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    textDecoration: 'none',
    marginBottom: 2,
  },
  companyText: {
    fontSize: 6,
    color: '#000000',
    marginBottom: 0.5,
  },
  companyTextBold: {
    fontSize: 6.2,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    marginBottom: 0.5,
  },
  // Bottom left: Buyer block
  buyerBlock: {
    height: 80,
    padding: 6,
    flexDirection: 'column',
  },
  buyerLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#4b5563',
    marginBottom: 2,
  },
  buyerName: {
    fontSize: 8.2,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    marginBottom: 2,
  },
  buyerText: {
    fontSize: 6.8,
    color: '#000000',
    marginBottom: 0.8,
  },
  buyerTextBold: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    marginBottom: 0.8,
  },
  // Right grid layout styles
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    height: 24,
  },
  gridCell: {
    width: '50%',
    padding: 3,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  gridLabel: {
    fontSize: 5.5,
    color: '#4b5563',
    fontFamily: 'Helvetica',
  },
  gridValue: {
    fontSize: 7.2,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    marginTop: 1,
  },
  rightBorder: {
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  sectionTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  // Table styles
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    textAlign: 'center',
    alignItems: 'stretch',
    minHeight: 20,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    padding: 3,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    minHeight: 22,
    alignItems: 'stretch',
  },
  cellText: {
    fontSize: 7,
    fontFamily: 'Helvetica',
  },
  cellTextBold: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },
  // Table column widths
  colNo: { width: '6%', borderRightWidth: 1, borderRightColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  colDesc: { width: '44%', borderRightWidth: 1, borderRightColor: '#000000', justifyContent: 'center', paddingLeft: 6, paddingRight: 4, paddingVertical: 3 },
  colHsn: { width: '10%', borderRightWidth: 1, borderRightColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  colQty: { width: '12%', borderRightWidth: 1, borderRightColor: '#000000', justifyContent: 'center', alignItems: 'flex-end', paddingRight: 6 },
  colRate: { width: '10%', borderRightWidth: 1, borderRightColor: '#000000', justifyContent: 'center', alignItems: 'flex-end', paddingRight: 6 },
  colUnit: { width: '6%', borderRightWidth: 1, borderRightColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  colAmount: { width: '12%', justifyContent: 'center', alignItems: 'flex-end', paddingRight: 6 },
  productLink: {
    color: '#1d4ed8',
    textDecoration: 'underline',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
  },
  weightSubtext: {
    fontSize: 5.5,
    color: '#4b5563',
    marginTop: 1,
  },
  // Totals layout
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
    borderBottomColor: '#000000',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    backgroundColor: '#f3f4f6',
  },
  grandTotalText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.2,
  },
  // HSN Breakdown
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
    alignItems: 'stretch',
    minHeight: 16,
  },
  hsnHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    textAlign: 'center',
    alignItems: 'stretch',
  },
  hsnCol: {
    padding: 3,
    fontSize: 6.5,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    justifyContent: 'center',
  },
  // Footer & signatures
  footerSection: {
    flexDirection: 'row',
    marginTop: 'auto',
    minHeight: 80,
    borderTopWidth: 1,
    borderTopColor: '#000000',
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
    width: '85%',
    textAlign: 'center',
    paddingTop: 4,
    fontSize: 7.2,
    fontFamily: 'Helvetica-Bold',
  },
});

interface QuotationPDFProps {
  data: QuotationFormData;
}

export const QuotationPDF: React.FC<QuotationPDFProps> = ({ data }) => {
  const { 
    quotationNumber, 
    quotationDate, 
    buyer, 
    items, 
    taxType, 
    bankDetails, 
    authorisedSignatory,
    deliveryNote,
    modeTermsOfPayment,
    referenceNo,
    otherReferences,
    buyerOrderNo,
    buyerOrderDate,
    dispatchDocNo,
    deliveryNoteDate,
    dispatchedThrough,
    destination,
    termsOfDelivery
  } = data;

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
          {/* Tally-Style Header Section */}
          <View style={styles.headerSection}>
            
            {/* Left Header Column: Company Details + Buyer details */}
            <View style={styles.leftHeaderColumn}>
              
              {/* Company details with SVG logo */}
              <View style={styles.companyBlock}>
                <View style={styles.logoBlock}>
                  <Svg width="50" height="40" viewBox="0 0 100 80">
                    {/* Base house shape */}
                    <Path d="M 20 45 L 50 18 L 80 45" fill="none" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M 28 42 L 28 75 L 72 75 L 72 42" fill="none" stroke="#1e3a8a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Door */}
                    <Rect x="43" y="55" width="14" height="20" fill="#1d4ed8" />
                    
                    {/* Windows */}
                    <Rect x="36" y="32" width="10" height="10" fill="#1d4ed8" stroke="#ffffff" strokeWidth="1" />
                    <Rect x="54" y="32" width="10" height="10" fill="#1d4ed8" stroke="#ffffff" strokeWidth="1" />

                    {/* Gear icon on roof line */}
                    <Circle cx="72" cy="22" r="10" fill="#ffffff" stroke="#1e3a8a" strokeWidth="3" />
                    <Path d="M 72 8 L 72 12 M 72 32 L 72 36 M 58 22 L 62 22 M 82 22 L 86 22 M 62 12 L 65 15 M 79 29 L 82 32 M 62 32 L 65 29 M 79 15 L 82 12" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
                    <Circle cx="72" cy="22" r="5" fill="#1e3a8a" />
                  </Svg>
                  <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#1e3a8a', marginTop: 1, letterSpacing: 0.5 }}>JMK</Text>
                  <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 4.8, color: '#4b5563', marginTop: 1, letterSpacing: 0.2 }}>ENGINEERING</Text>
                  <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 4.8, color: '#4b5563', letterSpacing: 0.2 }}>& DEVELOPER</Text>
                </View>
                
                <View style={styles.companyDetailsBlock}>
                  <Link src="https://www.indiamart.com/jmkengineeringdevelopers/" style={styles.companyName}>
                    JMK ENGINEERING & DEVELOPER
                  </Link>
                  <Text style={styles.companyText}>MAUZA JHALI, CIRCLE KANKARBAGH</Text>
                  <Text style={styles.companyText}>50B,WARD 55 P.NO-2167078,</Text>
                  <Text style={styles.companyText}>JAKARIYAPUR, TRINITY GLOBAL SCHOOL,</Text>
                  <Text style={styles.companyText}>ROAD NO 3, KRISHNA NIKETAN ROAD, PATNA</Text>
                  <Text style={styles.companyTextBold}>GSTIN/UIN: 10BIEPD2766D2ZX</Text>
                  <Text style={styles.companyText}>State Name: Bihar, Code: 10</Text>
                  <Text style={styles.companyText}>Contact: 7493916194</Text>
                </View>
              </View>

              {/* Buyer (Bill to) details */}
              <View style={styles.buyerBlock}>
                <Text style={styles.buyerLabel}>Buyer (Bill to)</Text>
                <Text style={styles.buyerName}>{buyer.name || 'N/A'}</Text>
                <Text style={styles.buyerText}>{buyer.address || 'N/A'}</Text>
                {buyer.gstin ? (
                  <>
                    <Text style={styles.buyerTextBold}>GSTIN/UIN: {buyer.gstin}</Text>
                    <Text style={styles.buyerText}>
                      State Name: {getStateFromGSTIN(buyer.gstin)?.name || 'N/A'}, Code: {buyer.gstin.substring(0, 2)}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.buyerTextBold}>GSTIN/UIN: N/A</Text>
                    <Text style={styles.buyerText}>State Name: Bihar, Code: 10</Text>
                  </>
                )}
                {buyer.phone ? <Text style={styles.buyerText}>Phone: {buyer.phone}</Text> : null}
                {buyer.email ? <Text style={styles.buyerText}>Email: {buyer.email}</Text> : null}
              </View>
            </View>

            {/* Right Header Column: Tally Dispatch details */}
            <View style={styles.rightHeaderColumn}>
              {/* Row 1 */}
              <View style={styles.gridRow}>
                <View style={[styles.gridCell, styles.rightBorder]}>
                  <Text style={styles.gridLabel}>Quotation No.</Text>
                  <Text style={styles.gridValue}>{quotationNumber}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.gridLabel}>Dated</Text>
                  <Text style={styles.gridValue}>{quotationDate}</Text>
                </View>
              </View>
              
              {/* Row 2 */}
              <View style={styles.gridRow}>
                <View style={[styles.gridCell, styles.rightBorder]}>
                  <Text style={styles.gridLabel}>Delivery Note</Text>
                  <Text style={styles.gridValue}>{deliveryNote || ' '}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.gridLabel}>Mode/Terms of Payment</Text>
                  <Text style={styles.gridValue}>{modeTermsOfPayment || ' '}</Text>
                </View>
              </View>
              
              {/* Row 3 */}
              <View style={styles.gridRow}>
                <View style={[styles.gridCell, styles.rightBorder]}>
                  <Text style={styles.gridLabel}>Reference No. & Date</Text>
                  <Text style={styles.gridValue}>{referenceNo || ' '}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.gridLabel}>Other References</Text>
                  <Text style={styles.gridValue}>{otherReferences || ' '}</Text>
                </View>
              </View>

              {/* Row 4 */}
              <View style={styles.gridRow}>
                <View style={[styles.gridCell, styles.rightBorder]}>
                  <Text style={styles.gridLabel}>Buyer's Order No.</Text>
                  <Text style={styles.gridValue}>{buyerOrderNo || ' '}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.gridLabel}>Dated</Text>
                  <Text style={styles.gridValue}>{buyerOrderDate || ' '}</Text>
                </View>
              </View>

              {/* Row 5 */}
              <View style={styles.gridRow}>
                <View style={[styles.gridCell, styles.rightBorder]}>
                  <Text style={styles.gridLabel}>Dispatch Doc No.</Text>
                  <Text style={styles.gridValue}>{dispatchDocNo || ' '}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.gridLabel}>Delivery Note Date</Text>
                  <Text style={styles.gridValue}>{deliveryNoteDate || ' '}</Text>
                </View>
              </View>

              {/* Row 6 */}
              <View style={styles.gridRow}>
                <View style={[styles.gridCell, styles.rightBorder]}>
                  <Text style={styles.gridLabel}>Dispatched through</Text>
                  <Text style={styles.gridValue}>{dispatchedThrough || ' '}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.gridLabel}>Destination</Text>
                  <Text style={styles.gridValue}>{destination || ' '}</Text>
                </View>
              </View>

              {/* Row 7 - Full width */}
              <View style={[styles.gridRow, { borderBottomWidth: 0, height: 24 }]}>
                <View style={[styles.gridCell, { width: '100%' }]}>
                  <Text style={styles.gridLabel}>Terms of Delivery</Text>
                  <Text style={styles.gridValue}>{termsOfDelivery || ' '}</Text>
                </View>
              </View>
            </View>
            
          </View>

          {/* Description of Goods Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.colNo}>
                <Text style={styles.tableHeaderCell}>Sl. No.</Text>
              </View>
              <View style={styles.colDesc}>
                <Text style={[styles.tableHeaderCell, { textAlign: 'left', paddingLeft: 2 }]}>Description of Goods</Text>
              </View>
              <View style={styles.colHsn}>
                <Text style={styles.tableHeaderCell}>HSN/SAC</Text>
              </View>
              <View style={styles.colQty}>
                <Text style={styles.tableHeaderCell}>Quantity</Text>
              </View>
              <View style={styles.colRate}>
                <Text style={styles.tableHeaderCell}>Rate</Text>
              </View>
              <View style={styles.colUnit}>
                <Text style={styles.tableHeaderCell}>Per</Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.tableHeaderCell}>Amount</Text>
              </View>
            </View>

            {items.map((item, index) => {
              const hasWeight = item.unitWeight && item.unitWeight > 0;
              const rowWeight = calculateItemWeight(item);

              return (
                <View key={item.id} style={styles.tableRow}>
                  <View style={styles.colNo}>
                    <Text style={styles.cellText}>{index + 1}</Text>
                  </View>
                  <View style={styles.colDesc}>
                    {item.photoUrl ? (
                      <Link src={item.photoUrl} style={styles.productLink}>
                        {item.productName}
                      </Link>
                    ) : (
                      <Text style={styles.cellTextBold}>{item.productName}</Text>
                    )}
                    {hasWeight ? (
                      <Text style={styles.weightSubtext}>
                        Unit Weight: {item.unitWeight} kg | Total Weight: {rowWeight} kg
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.colHsn}>
                    <Text style={styles.cellText}>{item.hsn}</Text>
                  </View>
                  <View style={styles.colQty}>
                    <Text style={styles.cellTextBold}>{item.quantity.toFixed(2)} {item.unit}</Text>
                  </View>
                  <View style={styles.colRate}>
                    <Text style={styles.cellText}>{item.rate.toFixed(2)}</Text>
                  </View>
                  <View style={styles.colUnit}>
                    <Text style={styles.cellText}>{item.unit}</Text>
                  </View>
                  <View style={styles.colAmount}>
                    <Text style={styles.cellTextBold}>{(item.quantity * item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
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
                <View style={{ borderTopWidth: 1, borderTopColor: '#000000', paddingTop: 4 }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>Total Weight for Logistics: {totalWeight.toLocaleString('en-IN')} kg</Text>
                  <Text style={{ fontSize: 6.5, color: '#4b5563', marginTop: 1 }}>
                    * Transport/Logistics charges are extra based on shipment weight of {totalWeight} kg.
                  </Text>
                </View>
              ) : null}
            </View>
            
            <View style={styles.totalsBlock}>
              <View style={styles.totalRow}>
                <Text style={styles.cellText}>Subtotal (Taxable Value):</Text>
                <Text style={styles.cellTextBold}>{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
              {taxType === 'igst' ? (
                <View style={styles.totalRow}>
                  <Text style={styles.cellText}>IGST @ 18%:</Text>
                  <Text style={styles.cellTextBold}>{taxes.igst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                </View>
              ) : (
                <>
                  <View style={styles.totalRow}>
                    <Text style={styles.cellText}>CGST @ 9%:</Text>
                    <Text style={styles.cellTextBold}>{taxes.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.cellText}>SGST @ 9%:</Text>
                    <Text style={styles.cellTextBold}>{taxes.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
                </>
              )}
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalText}>Grand Total:</Text>
                <Text style={styles.grandTotalText}>INR {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
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
                      <View style={[styles.hsnCol, { width: '20%' }]}>
                        <Text style={{ fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>HSN/SAC</Text>
                      </View>
                      <View style={[styles.hsnCol, { width: '25%' }]}>
                        <Text style={{ fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>Taxable Value (INR)</Text>
                      </View>
                      <View style={[styles.hsnCol, { width: '15%' }]}>
                        <Text style={{ fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>IGST Rate</Text>
                      </View>
                      <View style={[styles.hsnCol, { width: '20%' }]}>
                        <Text style={{ fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>IGST Amount (INR)</Text>
                      </View>
                      <View style={[styles.hsnCol, { width: '20%', borderRightWidth: 0 }]}>
                        <Text style={{ fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>Total Tax (INR)</Text>
                      </View>
                    </View>
                    {hsnBreakup.map((row) => (
                      <View key={row.hsn} style={styles.hsnRow}>
                        <View style={[styles.hsnCol, { width: '20%', textAlign: 'center' }]}>
                          <Text>{row.hsn}</Text>
                        </View>
                        <View style={[styles.hsnCol, { width: '25%', textAlign: 'right' }]}>
                          <Text>{row.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={[styles.hsnCol, { width: '15%', textAlign: 'center' }]}>
                          <Text>{row.igstRate}%</Text>
                        </View>
                        <View style={[styles.hsnCol, { width: '20%', textAlign: 'right' }]}>
                          <Text>{(row.igstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={[styles.hsnCol, { width: '20%', textAlign: 'right', borderRightWidth: 0 }]}>
                          <Text>{row.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                      </View>
                    ))}
                  </>
                ) : (
                  <>
                    <View style={styles.hsnHeader}>
                      <View style={[styles.hsnCol, { width: '15%' }]}>
                        <Text style={{ fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>HSN/SAC</Text>
                      </View>
                      <View style={[styles.hsnCol, { width: '25%' }]}>
                        <Text style={{ fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>Taxable Value (INR)</Text>
                      </View>
                      <View style={[styles.hsnCol, { width: '20%' }]}>
                        <Text style={{ fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>CGST (9%) (INR)</Text>
                      </View>
                      <View style={[styles.hsnCol, { width: '20%' }]}>
                        <Text style={{ fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>SGST (9%) (INR)</Text>
                      </View>
                      <View style={[styles.hsnCol, { width: '20%', borderRightWidth: 0 }]}>
                        <Text style={{ fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>Total Tax (INR)</Text>
                      </View>
                    </View>
                    {hsnBreakup.map((row) => (
                      <View key={row.hsn} style={styles.hsnRow}>
                        <View style={[styles.hsnCol, { width: '15%', textAlign: 'center' }]}>
                          <Text>{row.hsn}</Text>
                        </View>
                        <View style={[styles.hsnCol, { width: '25%', textAlign: 'right' }]}>
                          <Text>{row.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={[styles.hsnCol, { width: '20%', textAlign: 'right' }]}>
                          <Text>{(row.cgstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={[styles.hsnCol, { width: '20%', textAlign: 'right' }]}>
                          <Text>{(row.sgstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={[styles.hsnCol, { width: '20%', textAlign: 'right', borderRightWidth: 0 }]}>
                          <Text>{row.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
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
              
              <Text style={styles.cellText}>
                <Text>Bank Name: </Text>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>{bankDetails.bankName}</Text>
              </Text>
              
              <Text style={styles.cellText}>
                <Text>Account No: </Text>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>{bankDetails.accountNumber}</Text>
              </Text>
              
              <Text style={styles.cellText}>
                <Text>IFSC Code: </Text>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>{bankDetails.ifsc}</Text>
              </Text>
              
              <Text style={styles.cellText}>
                <Text>PAN: </Text>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>BIEPD2766D</Text>
              </Text>
              
              <Text style={styles.cellText}>
                <Text>GSTIN: </Text>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>10BIEPD2766D2ZX</Text>
              </Text>
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
