<script>
  import { onDestroy, onMount } from 'svelte';
  import AttendanceCategory from './AttendanceCategory.svelte';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';
  import { showToast } from '$lib/stores/toast';
  import AttendanceName from './AttendanceName.svelte';
  import AttendanceTable from '$lib/components/AttendanceTable.svelte';
  import Button from '$lib/components/Button.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Model from '$lib/components/Model.svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus';

  const { data, form } = $props();

  let openCategory = $state(false);
  let openNames = $state(false);
  let helperOpened = $state(false);

  const availableOptions = [
    { key: 'H', description: 'List available Shortcut' },
    { key: '1', description: 'Goto Previous Cycle Attendance' },
    { key: '2', description: 'Goto Next Cycle Attendance' },
    { key: '3', description: 'Open Category Manager' },
    { key: '4', description: 'Open Names Manager' },
    { key: '5', description: 'Print Attendance Sheet' },
    { key: '🠈', description: 'Move to previous Date' }, // 🠈	🠉	🠊	🠋
    { key: '🠊', description: 'Move to next Date' },
    { key: '🠉', description: 'Move to previous Name' },
    { key: '🠋', description: 'Move to next Name' },
    { key: 'Ctrl', description: 'Change focus between Table' },
    { key: 'Enter', description: 'Edit Attendance' },
  ];

  const handleCategoryClose = () => (openCategory = false);
  const handleNameClose = () => (openNames = false);
  const handleHelperOpen = () => (helperOpened = true);
  const handlePreviousAttendanceCycle = () => handleCycleOffset(-1);
  const handleNextAttendanceCycle = () => handleCycleOffset(1);
  const handleCategoryOpen = () => (openCategory = true);
  const handleNameOpen = () => (openNames = true);

  function handleCycleOffset(offset) {
    goto(resolve(`/attendance?cycleOffset=${data.cycle.cycleOffset + offset}`));
  }

  function handleCurrentCycleOffset() {
    goto(resolve(`/attendance?cycleOffset=${0}`));
  }

  $effect(() => {
    if (form?.message) {
      showToast(form.message, form.ok ? 'success' : 'danger');
    }
  });
  onMount(() => {
    syncOn('ATTENDANCE.LIST');
    keyboardEventBus.on('H', handleHelperOpen);
    keyboardEventBus.on('1', handlePreviousAttendanceCycle);
    keyboardEventBus.on('2', handleNextAttendanceCycle);
    keyboardEventBus.on('3', handleCategoryOpen);
    keyboardEventBus.on('4', handleNameOpen);
  });
  onDestroy(() => {
    syncOff('ATTENDANCE.LIST');
    keyboardEventBus.off('H', handleHelperOpen);
    keyboardEventBus.off('1', handlePreviousAttendanceCycle);
    keyboardEventBus.off('2', handleNextAttendanceCycle);
    keyboardEventBus.off('3', handleCategoryOpen);
    keyboardEventBus.off('4', handleNameOpen);
  });
</script>

<div class="flex h-full gap-4 p-5">
  <div class="overflow-auto">
    <AttendanceTable {...data} />
  </div>
  <div class="flex min-w-52 flex-col gap-2">
    <div class="dark flex w-full items-center gap-1">
      <Button onclick={handlePreviousAttendanceCycle} corner="1">&#129128;</Button>
      <Badge class="flex-1 text-center" onclick={() => handleCurrentCycleOffset()}>
        {data.cycle.shortName}
      </Badge>
      <Button onclick={handleNextAttendanceCycle} corner="2">&#129130;</Button>
    </div>
    <div class="dark">
      <Button corner="3" class="w-full" onclick={() => (openCategory = true)}
        >Modify Category</Button
      >
    </div>
    <div class="dark">
      <Button corner="4" class="w-full" onclick={() => (openNames = true)}>Modify Names</Button>
    </div>
    <div class="dark">
      <Button class="w-full" disabled>Print Attendance Sheet</Button>
    </div>
  </div>
</div>

<AttendanceCategory
  attendanceCategories={data.attendanceCategories}
  open={openCategory}
  onClose={handleCategoryClose}
/>
<AttendanceName
  open={openNames}
  onClose={handleNameClose}
  attendanceNames={data.attendanceNames}
  attendanceCategories={data.attendanceCategories}
/>

<!-- Helper Dialog -->
<Model open={helperOpened} onClose={() => (helperOpened = false)}>
  <div class="min-w-md bg-white p-5">
    {#each availableOptions as o (o.key)}
      <div class="m-1 mb-2 flex items-center gap-2">
        <span class="inline-block flex-1 rounded-xs bg-gray-300 px-3 text-center">{o.key}</span>
        <span>=</span>
        <span class="flex-11">{o.description}</span>
      </div>
    {/each}
  </div>
</Model>
