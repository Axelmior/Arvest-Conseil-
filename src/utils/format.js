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
