<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';
  import { getFormattedDate } from '$lib/utils/dateTime';
  const { open, onClose, editableItem, editableCategory } = $props();
  const options = {
    'Absent (0)': 0,
    'Present Full day (1)': 1,
    'Present Half day (0.5)': 0.5,
    'Present One & Half day (1.5)': 1.5,
    'Present with Night Duty (2)': 2,
  };
  let attendance = $state(-1);

  function handleFormSubmit() {
    return async ({ result }) => {
      if (result.type == 'failure') {
        showToast(result?.data?.message || 'Enter Correct Details', 'danger');
      } else {
        showToast(result?.data?.message || 'Success');
        onClose();
      }
    };
  }
</script>

<Model {open} {onClose} autoFocusTabIndex={1}>
  <Form
    title="Edit Attendance"
    method="POST"
    class="max-w-md"
    enhance={handleFormSubmit}
    action="?/editAttendance"
    cancel={onClose}
    isEdit={editableItem.id}
  >
    <InputField placeholder="Date" disabled value={getFormattedDate(editableItem.date)} />
    <InputField placeholder="Name" disabled value={editableItem.name} />
    <InputField
      placeholder="Attendance"
      options={Object.keys(options)}
      onValueSelected={(value) => {
        attendance = options[value] ?? -1;
      }}
      value={Object.keys(options).find((key) => options[key] === editableItem?.fields?.AT)}
    />
    {#each editableCategory.fields as field, index (index)}
      <InputField
        name={`fields[${field.shortName}]`}
        placeholder={field.longName}
        value={editableItem?.fields?.[field.shortName] || ''}
      />
    {/each}
    <InputField name="fields[Adv]" placeholder="Advance" value={editableItem?.fields?.Adv || ''} />
    <input type="hidden" name="date" value={editableItem.date} />
    <input type="hidden" name="nameId" value={editableItem.nameId} />
    <input type="hidden" name="fields[AT]" bind:value={attendance} />
    {#if editableItem?.id}
      <input type="hidden" name="id" value={editableItem.id} />
    {/if}
  </Form>
</Model>
