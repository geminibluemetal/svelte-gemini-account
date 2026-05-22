<div class="p-5">
  <div
    class="grid grid-cols-[max-content_200px_repeat(56,max-content)] overflow-auto border-2 *:px-1"
  >
    <!-- Heading -->
    <div
      class="sticky left-0 row-span-2 flex items-center justify-center border-r-2 border-b-2 bg-black text-white"
    >
      SN
    </div>
    <div
      class="sticky left-7.75 row-span-2 flex items-center justify-center truncate border-r-2 border-b-2 bg-black text-white"
    >
      Jelly Driver
    </div>
    <div class="col-span-4 border-r-2 border-b-2 bg-black text-center text-white">
      01-01-2026 <div class="-mt-1 text-sm text-white/70">Monday</div>
    </div>
    <div class="col-span-4 border-r-2 border-b-2 bg-black text-center text-white">
      02-01-2026 <div class="-mt-1 text-sm text-white/70">Monday</div>
    </div>
    <div class="col-span-4 border-r-2 border-b-2 bg-black text-center text-white">
      03-01-2026 <div class="-mt-1 text-sm text-white/70">Monday</div>
    </div>
    <div class="col-span-4 border-r-2 border-b-2 bg-black text-center text-white">
      04-01-2026 <div class="-mt-1 text-sm text-white/70">Monday</div>
    </div>
    <div class="col-span-4 border-r-2 border-b-2 bg-black text-center text-white">
      05-01-2026 <div class="-mt-1 text-sm text-white/70">Monday</div>
    </div>
    <div class="col-span-4 border-r-2 border-b-2 bg-black text-center text-white">
      06-01-2026 <div class="-mt-1 text-sm text-white/70">Monday</div>
    </div>
    <div class="col-span-4 border-r-2 border-b-2 bg-black text-center text-white">
      07-01-2026 <div class="-mt-1 text-sm text-white/70">Monday</div>
    </div>
    <div class="col-span-4 border-r-2 border-b-2 bg-black text-center text-white">
      08-01-2026 <div class="-mt-1 text-sm text-white/70">Monday</div>
    </div>
    <div class="col-span-4 border-r-2 border-b-2 bg-black text-center text-white">
      09-01-2026 <div class="-mt-1 text-sm text-white/70">Monday</div>
    </div>
    <div class="col-span-4 border-r-2 border-b-2 bg-black text-center text-white">
      10-01-2026 <div class="-mt-1 text-sm text-white/70">Monday</div>
    </div>
    <div class="col-span-4 border-r-2 border-b-2 bg-black text-center text-white">
      11-01-2026 <div class="-mt-1 text-sm text-white/70">Monday</div>
    </div>
    <div class="col-span-4 border-r-2 border-b-2 bg-black text-center text-white">
      12-01-2026 <div class="-mt-1 text-sm text-white/70">Monday</div>
    </div>
    <div class="col-span-4 border-r-2 border-b-2 bg-black text-center text-white">
      13-01-2026 <div class="-mt-1 text-sm text-white/70">Monday</div>
    </div>
    <div class="col-span-4 border-b-2 bg-black text-center text-white">
      14-01-2026 <div class="-mt-1 text-sm text-white/70">Monday</div>
    </div>

    <!-- Heading 2 -->
    {#each Array.from({ length: 14 }) as _, index (index)}
      <div class="border-r border-b-2 bg-black text-white">AT</div>
      <div class="border-r border-b-2 bg-black text-white">T</div>
      <div class="border-r border-b-2 bg-black text-white">W</div>
      <div class="{index != 13 && 'border-r-2'} border-b-2 bg-black text-white">Adv</div>
    {/each}

    <div class="sticky left-0 border-r-2 border-b bg-white">1</div>
    <div class="sticky left-7.75 truncate border-r-2 border-b bg-white">Ashok Kumar</div>
    {#each Array.from({ length: 14 }) as _, index (index)}
      <div class="border-r border-b">1</div>
      <div class="border-r border-b">2</div>
      <div class="border-r border-b">3</div>
      <div class="{index != 13 && 'border-r-2 '} border-b">4</div>
    {/each}

    <div class="sticky left-0 border-r-2 border-b bg-white">1</div>
    <div class="sticky left-7.75 truncate border-r-2 border-b bg-white">Ashok Kumar</div>
    {#each Array.from({ length: 14 }) as _, index (index)}
      <div class="border-r border-b">1</div>
      <div class="border-r border-b">2</div>
      <div class="border-r border-b">3</div>
      <div class="{index != 13 && 'border-r-2 '} border-b">4</div>
    {/each}

    <div class="sticky left-0 border-r-2 border-b bg-white">1</div>
    <div class="sticky left-7.75 truncate border-r-2 border-b bg-white">Ashok Kumar</div>
    {#each Array.from({ length: 14 }) as _, index (index)}
      <div class="border-r border-b">1</div>
      <div class="border-r border-b">2</div>
      <div class="border-r border-b">3</div>
      <div class="{index != 13 && 'border-r-2 '} border-b">4</div>
    {/each}
  </div>
</div>
