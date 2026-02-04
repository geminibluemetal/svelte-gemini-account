<script>
  import { getFormattedTime } from '$lib/utils/dateTime';
  import { parseTime } from '$lib/utils/dateTimeParser';
  import InputField from './InputField.svelte';

  let { placeholder = 'Enter Time', value = $bindable(), ...props } = $props();
  let displayValue = $derived(value && getFormattedTime(value));

  function handleDateInput(e) {
    displayValue = null;
    let input = e.target.value.trim();
    value = value || new Date();
    let parsed = input == '0' ? parseTime(getFormattedTime(), value) : parseTime(input, value);
    value = '';
    value = parsed;
  }
</script>

<InputField
  value={displayValue}
  onblur={handleDateInput}
  caseMode="none"
  {placeholder}
  {...props}
/>
