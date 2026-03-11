export async function load() {
  const apps = [
    { name: 'Order Book', emoji: '📘', url: '/orders', key: 'O' },
    { name: 'Tokens', emoji: '🎟️', url: '/tokens', key: 'T' },
    { name: 'Delivery Sheet', emoji: '🧾', url: '/delivery', key: 'D' },
    { name: 'Cash Report', emoji: '💰', url: '/cash', key: 'C' },
    { name: 'Balance Sheet', emoji: '📊', url: '/balance', key: 'B' },
    { name: 'Party', emoji: '👥', url: '/party', key: 'P' },
    { name: 'Address', emoji: '🗺️', url: '/address', key: 'A' },
    { name: 'Items', emoji: '📦', url: '/items', key: 'I' },
    { name: 'Vehicle', emoji: '🚚', url: '/vehicle', key: 'V' },
    // { name: 'Settings', emoji: '⚙️', url: '/settings', key: 'S' },
  ];
  return { apps };
}
