<script>
  import { runCalculateRule } from './calculationRule';
  const { attendanceCategories, attendanceNames, attendance, cycle } = $props();
</script>

<div class="hidden px-5 print:block">
  <div class="text-center">
    {cycle.longName}
  </div>
  {#each attendanceCategories as category (category._id)}
    {@const names = attendanceNames.filter((an) => an.categoryId == category._id)}
    <div class="mb-5 break-inside-avoid">
      <div class="mb-2 text-center font-bold">{category.name}</div>
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100 *:border *:px-1 *:text-xs">
            <th>Sn</th>
            <th>Name</th>
            {#each category.calculationRule as rule (rule.id)}
              <th>{rule.name}</th>
            {/each}
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {#each names as name, index (name.id)}
            {@const attendanceData = attendance.filter((a) => a.nameId == name.id)}
            {@const calculatedData = runCalculateRule(name, category, attendanceData)}
            <tr class="*:border *:px-1 *:text-xs">
              <td>{index + 1}</td>
              <td class="whitespace-nowrap">{name.name}</td>
              {#each category.calculationRule as rule (rule.id)}
                <td>{calculatedData[rule.key] ?? ''}</td>
              {/each}
              <td></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/each}
</div>
