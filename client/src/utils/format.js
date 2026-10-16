export const formatViews = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000) {
    return `${(v / 1_000_000).toFixed(1).replace(".", ",").replace(",0", "")} M`;
  }
  if (v >= 1_000) {
    return `${(v / 1_000).toFixed(1).replace(".", ",").replace(",0", "")} K`;
  }
  return String(v);
};
