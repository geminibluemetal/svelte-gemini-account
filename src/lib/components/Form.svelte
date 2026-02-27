<!-- src\lib\components\Form.svelte -->
<script>
  import { enhance } from '$app/forms';
  import { LoaderCircle, X } from 'lucide-svelte';
  import Button from './Button.svelte';
  const {
    title,
    cancel,
    children = () => {},
    loading = false,
    isEdit = false,
    enhance: enhanceAction = undefined,
    submitButtonText = ['Save', 'Update'],
    cancelButtonText = 'Cancel',
    extraButtons,
    description,
    class: userClass = '',
    hideSubmitButton = false,
    ...props
  } = $props();

  let formEl = $state(null);

  function submit() {
    formEl?.requestSubmit();
  }

  export { submit };

  function handleCancel() {
    if (cancel) cancel();
    else window.history.back();
  }

  function conditionalEnhance(node, handler) {
    if (!handler) return;
    return enhance(node, handler);
  }
</script>

<form
  class="dark:bg-amber-1100 rounded-lg bg-white shadow-md {userClass}"
  {...props}
  bind:this={formEl}
  use:conditionalEnhance={enhanceAction}
>
  <!-- Card Header -->
  <div
    class="flex justify-between rounded-t-lg border-b-2 border-amber-200 bg-amber-100 px-3 py-2 dark:border-amber-900 dark:bg-amber-950"
  >
    <div>
      <h1 class="text-2xl font-semibold text-amber-900 dark:text-amber-100">{title}</h1>
      {#if description}
        {@render description()}
      {/if}
    </div>
    {#if cancel}
      <div class="inline-flex items-center">
        <button
          class="cursor-pointer rounded-full border bg-red-700 text-2xl text-white outline-2 outline-offset-1 outline-transparent hover:bg-red-800 hover:outline-red-800 focus:bg-red-800 focus:outline-red-800"
          onclick={cancel}
          type="button"
        >
          <X class="h-6 w-6 p-1" strokeWidth={3} size={8} />
        </button>
      </div>
    {/if}
  </div>

  <!-- Card Body -->
  <div class="p-4">
    {@render children()}
  </div>

  <!-- Card Footer -->
  <div
    class="flex justify-end gap-2 rounded-b-lg border-t-2 border-amber-200 bg-amber-100 px-3 py-2 dark:border-amber-900 dark:bg-amber-950"
  >
    <Button color="success" type="submit" class={hideSubmitButton && 'invisible'}>
      {#if loading}
        <LoaderCircle class="mr-1 animate-spin" /> Loading...
      {:else}
        <span>{isEdit ? submitButtonText[1] || 'Update' : submitButtonText[0] || 'Save'}</span>
      {/if}
    </Button>
    <Button type="button" onclick={handleCancel}>{cancelButtonText}</Button>
    {#if extraButtons}
      {@render extraButtons()}
    {/if}
  </div>
</form>
