<script>
  import { onDestroy, onMount } from 'svelte';
  import AttendanceCategory from './AttendanceCategory.svelte';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';
  import { showToast } from '$lib/stores/toast';
  import AttendanceName from './AttendanceName.svelte';
  import AttendanceTable from '$lib/components/AttendanceTable.svelte';

  const { data, form } = $props();

  $effect(() => {
    if (form?.message) {
      showToast(form.message, form.ok ? 'success' : 'danger');
    }
  });
  onMount(() => {
    syncOn('ATTENDANCE.LIST');
  });
  onDestroy(() => {
    syncOff('ATTENDANCE.LIST');
  });
</script>

<div class="h-full overflow-auto p-5">
  <AttendanceTable {...data} />
</div>

<AttendanceCategory attendanceCategories={data.attendanceCategories} />
<AttendanceName
  attendanceNames={data.attendanceNames}
  attendanceCategories={data.attendanceCategories}
/>
