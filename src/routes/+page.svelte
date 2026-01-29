<script>
  const apps = [
    { name: 'Order Book', emoji: '📘', url: '/orders' },
    { name: 'Tokens', emoji: '🎟️', url: '/tokens' },
    { name: 'Delivery Sheet', emoji: '🧾', url: '/delivery' },
    { name: 'Cash Report', emoji: '💰', url: '/cash' },
    { name: 'Party', emoji: '👥', url: '/party' },
    { name: 'Address', emoji: '🗺️', url: '/address' },
    { name: 'Items', emoji: '📦', url: '/items' },
    { name: 'More', emoji: '➕', url: '/more' }
  ];
</script>

<main class="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
  <!-- Heading -->
  <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Gemini Blue Metal Apps</h1>

  <!-- Description -->
  <p class="max-w-xl text-lg text-slate-600 mb-12">
    A simple and easy way to manage all sales accounts in one place.
  </p>

  <!-- App Tiles -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl w-full">
    {#each apps as app}
      <a
        href={app.url}
        class="group bg-white rounded-2xl shadow hover:shadow-lg transition p-6 flex flex-col items-center justify-center"
      >
        <div class="text-4xl mb-3 group-hover:scale-110 transition">
          {app.emoji}
        </div>
        <div class="font-semibold text-slate-800">
          {app.name}
        </div>
      </a>
    {/each}
  </div>
</main>
