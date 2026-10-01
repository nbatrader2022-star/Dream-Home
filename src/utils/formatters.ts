// Persian number and currency formatting utilities

export function toPersianDigits(num: number | string): string {
  if (num === undefined || num === null) return '';
  const idMap = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/[0-9]/g, (w) => idMap[+w]);
}

export function formatPrice(priceInTomans: number): string {
  if (!priceInTomans) return 'توافقی';
  
  if (priceInTomans >= 1_000_000_000) {
    const billions = priceInTomans / 1_000_000_000;
    const formatted = billions % 1 === 0 ? billions.toString() : billions.toFixed(1);
    return `${toPersianDigits(formatted)} میلیارد تومان`;
  }
  
  if (priceInTomans >= 1_000_000) {
    const millions = priceInTomans / 1_000_000;
    const formatted = millions % 1 === 0 ? millions.toString() : millions.toFixed(1);
    return `${toPersianDigits(formatted)} میلیون تومان`;
  }

  return `${toPersianDigits(priceInTomans.toLocaleString())} تومان`;
}

export function formatPriceShort(priceInTomans: number): string {
  if (!priceInTomans) return 'توافقی';
  if (priceInTomans >= 1_000_000_000) {
    const billions = priceInTomans / 1_000_000_000;
    const formatted = billions % 1 === 0 ? billions.toString() : billions.toFixed(1);
    return `${toPersianDigits(formatted)} م.ت`;
  }
  if (priceInTomans >= 1_000_000) {
    const millions = priceInTomans / 1_000_000;
    return `${toPersianDigits(Math.round(millions))} م`;
  }
  return `${toPersianDigits(priceInTomans)}`;
}

export function formatArea(area: number): string {
  return `${toPersianDigits(area)} متر`;
}
