<div class="p-5 h-screen flex flex-col">
  <!-- Grid Table Wrapper -->
  <div class="flex-1 overflow-auto border-2 border-black">
    <!-- HEADER -->
    <div class="sticky top-0 z-30 bg-white">
      <!-- Title Row -->
      <div
        class="grid grid-cols-10 bg-red-700 text-white text-center font-bold border-b-0 border-black"
      >
        <div class="col-span-full">Delivery Sheet</div>
      </div>

      <!-- Column Header Row -->
      <div
        class="grid grid-cols-10 bg-black text-white text-center border-white border-b-0 border-t-2"
      >
        {#each Array.from({ length: 10 }) as _, col}
          <div class="border-r-2 border-white last:border-r-0">
            S.no {col + 1}
          </div>
        {/each}
      </div>
    </div>

    <!-- BODY -->
    <div>
      {#each Array.from({ length: 50 }) as _, row}
        <div class="grid grid-cols-10 not-last:border-b border-gray-500 hover:bg-gray-200">
          {#each Array.from({ length: 10 }) as _, col}
            <div class="border-r border-gray-500 last:border-r-0 px-1 py-0.5">
              Vasans {row + 1}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>
