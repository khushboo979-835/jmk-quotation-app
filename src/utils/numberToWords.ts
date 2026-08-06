const ones: string[] = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens: string[] = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigit(n: number): string {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return tens[t] + (o ? ' ' + ones[o] : '');
}

function threeDigit(n: number): string {
  const h = Math.floor(n / 100);
  const rem = n % 100;
  return (h ? ones[h] + ' Hundred' + (rem ? ' ' : '') : '') + (rem ? twoDigit(rem) : '');
}

export function numberToWords(amount: number): string {
  if (!isFinite(amount)) return '';
  const negative = amount < 0;
  amount = Math.abs(amount);
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  if (rupees === 0 && paise === 0) return 'INR Zero Only';

  const parts: string[] = [];

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundredAndBelow = rupees % 1000;

  if (negative) parts.push('Minus');
  if (crore) parts.push((crore < 100 ? twoDigit(crore) : threeDigit(crore)) + ' Crore');
  if (lakh) parts.push((lakh < 100 ? twoDigit(lakh) : threeDigit(lakh)) + ' Lakh');
  if (thousand) parts.push((thousand < 100 ? twoDigit(thousand) : threeDigit(thousand)) + ' Thousand');
  if (hundredAndBelow) parts.push(threeDigit(hundredAndBelow));

  let words = parts.join(' ').trim();
  if (!words) words = 'Zero';

  let paiseWords = '';
  if (paise) {
    paiseWords = ' and ' + (paise < 100 ? twoDigit(paise) : threeDigit(paise)) + ' Paise';
  }

  return `INR ${words}${paiseWords} Only`;
}

export default numberToWords;
