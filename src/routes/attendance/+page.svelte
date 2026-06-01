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
  import AttendanceForm from './AttendanceForm.svelte';
  import AttendancePrint from './AttendancePrint.svelte';

  const { data, form } = $props();

  let openCategory = $state(false);
  let openNames = $state(false);
  let helperOpened = $state(false);
  let openAttendanceEdit = $state(false);
  let showAmount = $state(false);
  let editableItem = $state({});
  let editableCategory = $state({});

  const availableOptions = [
    { key: 'H', description: 'Show available shortcuts' },
    // Navigation
    { key: '🠈', description: 'Move to previous Date' },
    { key: '🠊', description: 'Move to next Date' },
    { key: '🠉', description: 'Move to previous Name' },
    { key: '🠋', description: 'Move to next Name' },
    { key: 'T', description: 'Change focus to next Table/Category' },
    // Attendance actions
    { key: 'R', description: 'Print payment receipt for the selected person' },
    { key: 'S', description: 'Show Amount Details in Table' },
    { key: 'P', description: 'Set Present for selected Attendace' },
    { key: 'A', description: 'Set Absent for selected Attendace' },
    { key: 'Enter', description: 'Edit selected Attendance' },
    // Cycle navigation
    {
      key: '<i class="font-black text-xl">&minus;</i>',
      description: 'Go to Previous Attendance Cycle',
    },
    {
      key: '<i class="font-black text-xl">&plus;</i>',
      description: 'Go to Next Attendance Cycle',
    },
    // Numeric shortcuts
    {
      key: 'Top Row 0-9',
      description: 'Set number in category field (second cell after AT)',
    },
    {
      key: 'Numpad 0-9',
      description: 'Set number in first category field near AT',
    },
  ];

  const handleCategoryClose = () => (openCategory = false);
  const handleNameClose = () => (openNames = false);
  const handleHelperOpen = () => (helperOpened = true);
  const handlePreviousAttendanceCycle = () => handleCycleOffset(-1);
  const handleNextAttendanceCycle = () => handleCycleOffset(1);
  const handleAttendanceFormClose = () => {
    openAttendanceEdit = false;
    editableItem = { nameId: null, date: null, name: null, id: null };
    editableCategory = {};
  };

  async function transportAction(url, data) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    return await res.json();
  }

  function handleCycleOffset(offset) {
    goto(resolve(`/attendance?cycleOffset=${data.cycle.cycleOffset + offset}`));
  }

  function handleCurrentCycleOffset() {
    goto(resolve(`/attendance?cycleOffset=${0}`));
  }

  function handleAttendanceEdit(nameId, date, id, categoryId) {
    if (!openCategory && !openNames && !helperOpened) {
      const name = data.attendanceNames.find((a) => a.id == nameId);
      const selectedAttendance = data.attendance.find((a) => a.id == id);
      editableItem = { nameId, date, name: name?.name, id, ...selectedAttendance };
      editableCategory = data.attendanceCategories.find((ac) => ac._id == categoryId);
      openAttendanceEdit = true;
    }
  }

  function handleAttendanceOverChange(nameId, date, id, categoryId) {
    const name = data.attendanceNames.find((a) => a.id == nameId);
    const selectedAttendance = data.attendance.find((a) => a.id == id);
    editableItem = { nameId, date, name: name?.name, id, ...selectedAttendance };
    editableCategory = data.attendanceCategories.find((ac) => ac._id == categoryId);
  }

  function handleCycleClear() {
    const confirmation = confirm(`Are you going to clear Attendance from ${data.cycle.longName}?`);
    if (confirmation) transportAction('?/clearCycle', { cycleOffset: data.cycle.cycleOffset });
  }

  function handleShortcutPresent() {
    if (!openCategory && !openNames && !helperOpened) {
      if (editableItem.nameId && editableItem.date) {
        const data = { nameId: editableItem.nameId, date: editableItem.date, 'fields[AT]': 1 };
        if (editableItem.id) data.id = editableItem.id;
        transportAction('?/setAttendance', data);
      }
    }
  }

  function handleShortcutAbsent() {
    if (!openCategory && !openNames && !helperOpened) {
      if (editableItem.nameId && editableItem.date) {
        const data = { nameId: editableItem.nameId, date: editableItem.date, 'fields[AT]': 0 };
        if (editableItem.id) data.id = editableItem.id;
        transportAction('?/setAttendance', data);
      }
    }
  }

  function handlePaymentReceipt() {
    if (!openCategory && !openNames && !helperOpened && editableItem?.nameId) {
      const payload = {
        nameId: editableItem.nameId,
        startDate: data.cycle.startDate,
        endDate: data.cycle.endDate,
      };
      transportAction('?/printReceipt', payload);
    }
  }

  function handleKeyDown(e) {
    // 1. IGNORE if the user is typing in an input, textarea, or select dropdown
    const tagName = e.target.tagName;
    if (
      tagName === 'INPUT' ||
      tagName === 'TEXTAREA' ||
      tagName === 'SELECT' ||
      e.target.isContentEditable
    ) {
      return;
    }
    // 2. Your original logic runs only when NOT typing in an input
    if (e.key >= '0' && e.key <= '9') {
      if (!openCategory && !openNames && !helperOpened) {
        const pressedNumber = Number(e.key);
        const fields = editableCategory?.fields?.filter((f) => !f.isHidden);
        const type = e.code.startsWith('Numpad') ? 0 : e.code.startsWith('Digit') ? 1 : -1;
        if (editableItem.nameId && editableItem.date && type !== -1 && fields?.[type]?.shortName) {
          const shortName = fields[type].shortName;
          const data = {
            nameId: editableItem.nameId,
            date: editableItem.date,
            [`fields[${shortName}]`]: pressedNumber,
          };
          if (editableItem.id) data.id = editableItem.id;
          transportAction('?/setTip', data);
        }
      }
    }
  }

  function handleShowAmount() {
    showAmount = !showAmount;
  }

  $effect(() => {
    if (form?.message) {
      showToast(form.message, form.ok ? 'success' : 'danger');
    }
  });
  onMount(() => {
    syncOn('ATTENDANCE.LIST');
    keyboardEventBus.on('H', handleHelperOpen);
    keyboardEventBus.on('-', handlePreviousAttendanceCycle);
    keyboardEventBus.on('+', handleNextAttendanceCycle);
    keyboardEventBus.on('P', handleShortcutPresent);
    keyboardEventBus.on('A', handleShortcutAbsent);
    keyboardEventBus.on('R', handlePaymentReceipt);
    keyboardEventBus.on('S', handleShowAmount);
  });
  onDestroy(() => {
    syncOff('ATTENDANCE.LIST');
    keyboardEventBus.off('H', handleHelperOpen);
    keyboardEventBus.off('-', handlePreviousAttendanceCycle);
    keyboardEventBus.off('+', handleNextAttendanceCycle);
    keyboardEventBus.off('P', handleShortcutPresent);
    keyboardEventBus.off('A', handleShortcutAbsent);
    keyboardEventBus.off('R', handlePaymentReceipt);
    keyboardEventBus.off('S', handleShowAmount);
  });
</script>

<svelte:window on:keydown={handleKeyDown} />
<div class="flex h-full gap-4 p-5 print:hidden">
  <div class="overflow-auto">
    <AttendanceTable
      {...data}
      {showAmount}
      onEdit={handleAttendanceEdit}
      onOverRowChange={handleAttendanceOverChange}
    />
  </div>
  <div class="flex h-full min-w-58 flex-col gap-2">
    <div class="dark flex w-full items-center gap-1">
      <Button onclick={handlePreviousAttendanceCycle} corner="-">&#129128;</Button>
      <Badge class="flex-1 text-center" onclick={() => handleCurrentCycleOffset()}>
        {data.cycle.shortName}
      </Badge>
      <Button onclick={handleNextAttendanceCycle} corner="+">&#129130;</Button>
    </div>
    <div class="dark">
      <Button corner="S" class="w-full" onclick={handleShowAmount}>Show Amount</Button>
    </div>
    <div class="dark">
      <Button class="w-full" locked={data.isLockOpened} onclick={() => (openCategory = true)}>
        Modify Category
      </Button>
    </div>
    <div class="dark">
      <Button class="w-full" onclick={() => (openNames = true)}>Modify Names</Button>
    </div>
    <div class="dark">
      <Button class="w-full" onclick={() => window.print()}>Print Attendance Sheet</Button>
    </div>
    <div class="dark">
      {#if data.cycle.cycleOffset != 0}
        <Button class="w-full" color="danger" onclick={handleCycleClear}>
          Clear This Attendance Cycle
        </Button>
      {/if}
    </div>
    <div id="attendance-sidebar" class="h-full overflow-auto"></div>
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
        <span class="inline-block flex-1 rounded-xs bg-gray-300 px-3 text-center whitespace-nowrap">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html o.key}
        </span>
        <span>=</span>
        <span class="flex-11">{o.description}</span>
      </div>
    {/each}
  </div>
</Model>

<AttendanceForm
  open={openAttendanceEdit}
  onClose={handleAttendanceFormClose}
  {editableItem}
  {editableCategory}
/>

<AttendancePrint {...data} />
