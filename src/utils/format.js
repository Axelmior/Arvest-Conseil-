export const formatEuro = (n) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(n || 0);

export const formatEuroDecimal = (n) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(n || 0);

export const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return d;
  }
};

export function getChartScale(maxAbsValue) {
  if (maxAbsValue >= 1_000_000) return { divisor: 1_000_000, suffix: 'M€' };
  if (maxAbsValue >= 1_000) return { divisor: 1_000, suffix: 'K€' };
  return { divisor: 1, suffix: '€' };
}

export function makeChartFormatter(scale) {
  return (v) => {
    if (v === 0) return '0';
    const n = v / scale.divisor;
    return `${n % 1 === 0 ? n : n.toFixed(1)}${scale.suffix}`;
  };
}
