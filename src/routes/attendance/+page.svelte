<script>
  import { onDestroy, onMount } from 'svelte';
  import AttendanceCategory from './AttendanceCategory.svelte';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';
  import { showToast } from '$lib/stores/toast';
  import AttendanceName from './AttendanceName.svelte';

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

<AttendanceCategory attendanceCategories={data.attendanceCategories} />
<AttendanceName
  attendanceNames={data.attendanceNames}
  attendanceCategories={data.attendanceCategories}
/>
