<script>
  import { getFormattedDate } from '$lib/utils/dateTime';
  import { parseDate } from '$lib/utils/dateTimeParser';
  import InputField from './InputField.svelte';

  let { placeholder = 'Enter Date', value = $bindable(), ...props } = $props();
  let displayValue = $derived(value && getFormattedDate(value));

  function handleDateInput(e) {
    displayValue = null;
    let input = e.target.value.trim();
    let parsed = input == '0' ? parseDate(getFormattedDate()) : parseDate(input);
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
