export async function load() {
  const apps = [
    { name: 'Order Book', emoji: '📘', url: '/orders', key: 'O' },
    { name: 'Tokens', emoji: '🎟️', url: '/tokens', key: 'T' },
    { name: 'Delivery Sheet', emoji: '🧾', url: '/delivery', key: 'D' },
    { name: 'Cash Report', emoji: '💰', url: '/cash', key: 'C' },
    { name: 'Party', emoji: '👥', url: '/party', key: 'P' },
    { name: 'Address', emoji: '🗺️', url: '/address', key: 'A' },
    { name: 'Items', emoji: '📦', url: '/items', key: 'I' },
    { name: 'Weighment', emoji: '⚖️', url: '/weigh', key: 'W' },
  ];
  return { apps }
}