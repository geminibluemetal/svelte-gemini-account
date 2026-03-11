<script>
  import Button from '$lib/components/Button.svelte';
  import { getFormattedTimestamp } from '$lib/utils/dateTime';
</script>

{#snippet removeButton()}
  <button
    class="flex size-8 cursor-pointer items-center justify-center rounded bg-red-400 pb-1 text-2xl font-extrabold text-white hover:bg-red-600"
  >
    &times;
  </button>
{/snippet}

<div class="w-full">
  <div class="mx-auto mt-5 w-full max-w-xl overflow-hidden rounded border-2">
    <h1 class="border-b-2 bg-gray-200 p-3 text-center text-2xl">Access Device</h1>

    <div class="divide-y">
      <div class="flex items-center p-2 hover:bg-gray-100">
        <div class="flex-1">
          <div class="font-medium">Name 1</div>
          <div class="truncate text-sm text-gray-500">{getFormattedTimestamp()}</div>
          <div class="truncate text-xs text-gray-500">45h354h3lh543l5h4l5h3543l5h</div>
        </div>
        <div class="flex items-center gap-2">
          <Button color="success">Approved</Button>
          {@render removeButton()}
        </div>
      </div>
    </div>
  </div>
</div>
