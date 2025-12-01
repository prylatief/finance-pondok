
export const formatRupiah = (amount: number, withSymbol = true): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(/\s/g, '');
};

export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 9);
}
