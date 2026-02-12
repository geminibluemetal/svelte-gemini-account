<div class="bg-white p-5 max-w-7xl flex gap-2 justify-start items-start overflow-x-auto">
  {#each Array.from({ length: 20 }) as _}
    {#each Array.from({ length: 3 }) as _}
      <table class="border-2">
        <thead>
          <tr>
            <th class="border px-1" colspan="3">3652 G</th>
          </tr>
          <tr>
            <th class="border px-1">S.no</th>
            <th class="border px-1">Time</th>
            <th class="border px-1">Address</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border px-1 text-center">1</td>
            <td class="border px-1">time</td>
            <td class="border px-1">entry.address</td>
          </tr>
          <tr>
            <td class="border px-1 text-center">1</td>
            <td class="border px-1">time</td>
            <td class="border px-1">entry.address</td>
          </tr>
          <tr>
            <td class="border px-1 text-center">1</td>
            <td class="border px-1">time</td>
            <td class="border px-1">entry.address</td>
          </tr>
          <tr>
            <td class="border px-1 text-center">1</td>
            <td class="border px-1">time</td>
            <td class="border px-1">entry.address</td>
          </tr>
        </tbody>
      </table>
    {/each}
  {/each}
</div>
