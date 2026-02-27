<script>
  let { data } = $props();
  const apps = $derived(data.apps);
</script>

<main class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
  <!-- Heading -->
  <h1 class="mb-4 text-4xl font-extrabold text-slate-900 md:text-5xl">Gemini Blue Metal Works</h1>

  <!-- Description -->
  <p class="mb-12 max-w-xl text-lg text-slate-600">
    A simple and easy way to manage all sales accounts in one place.
  </p>

  <!-- App Tiles -->
  <div class="grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-5">
    {#each apps as app}
      <a
        href={app.url}
        class="group flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow transition hover:shadow-lg"
      >
        <div class="mb-3 text-4xl transition group-hover:scale-110">
          {app.emoji}
        </div>
        <div class="font-semibold text-slate-800">
          {app.name}
        </div>
        <div class="mt-2 rounded bg-gray-200 px-2 py-1 text-xs">
          Alt + {app.key}
        </div>
      </a>
    {/each}
  </div>
</main>
