<script>
  import { tick } from 'svelte';

  const {
    tip,
    position = 'top-center',
    class: userClass = '',
    tooltipClass = '',
    delay = 150,
    children
  } = $props();

  let show = $state(false);
  let timeout = $state(null);
  let triggerEl;
  let resolvedPosition = $state(position);
  let tooltipStyle = $state({ top: 0, left: 0 });

  const offset = 8; // space between trigger and tooltip

  function open() {
    clearTimeout(timeout);
    timeout = setTimeout(() => (show = true), delay);
  }

  function close() {
    clearTimeout(timeout);
    show = false;
  }

  function onEscape(e) {
    if (e.key === 'Escape') close();
  }

  function resolveAutoPosition() {
    if (!triggerEl) return 'top-center';
    const rect = triggerEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceTop = rect.top;
    const spaceBottom = vh - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = vw - rect.right;

    const verticalMax = Math.max(spaceTop, spaceBottom);
    const horizontalMax = Math.max(spaceLeft, spaceRight);

    if (verticalMax >= horizontalMax) {
      return spaceBottom >= spaceTop ? 'bottom-center' : 'top-center';
    } else {
      return spaceRight >= spaceLeft ? 'right-center' : 'left-center';
    }
  }

  async function updatePosition() {
    await tick();
    if (!triggerEl || !show) return;

    resolvedPosition = position === 'auto' ? resolveAutoPosition() : position;

    const rect = triggerEl.getBoundingClientRect();
    let top = 0;
    let left = 0;
    let transform = '';

    switch (resolvedPosition) {
      case 'top-center':
        top = rect.top - offset;
        left = rect.left + rect.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom-center':
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2;
        transform = 'translate(-50%, 0)';
        break;
      case 'top-left':
        top = rect.top - offset;
        left = rect.left;
        transform = 'translate(0, -100%)';
        break;
      case 'top-right':
        top = rect.top - offset;
        left = rect.right;
        transform = 'translate(-100%, -100%)';
        break;
      case 'bottom-left':
        top = rect.bottom + offset;
        left = rect.left;
        transform = 'translate(0, 0)';
        break;
      case 'bottom-right':
        top = rect.bottom + offset;
        left = rect.right;
        transform = 'translate(-100%, 0)';
        break;
      case 'left-center':
        top = rect.top + rect.height / 2;
        left = rect.left - offset;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right-center':
        top = rect.top + rect.height / 2;
        left = rect.right + offset;
        transform = 'translate(0, -50%)';
        break;
    }

    tooltipStyle = { top, left, transform };
  }

  $effect(() => {
    if (show) updatePosition();
  });

  function handleWindowChange() {
    if (show) updatePosition();
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);
  }
</script>

<div
  bind:this={triggerEl}
  class="relative inline-flex {userClass}"
  onmouseenter={open}
  onmouseleave={close}
  onfocusin={open}
  onfocusout={close}
  onkeydown={onEscape}
>
  {@render children()}

  {#if show}
    <div
      role="tooltip"
      class="
        pointer-events-none z-50
        text-xs rounded-md
        bg-gray-900 text-white
        dark:bg-white dark:text-black
        shadow-md
        whitespace-nowrap
        {tooltipClass}
      "
      style="position: fixed; top: {tooltipStyle.top}px; left: {tooltipStyle.left}px; transform: {tooltipStyle.transform};"
    >
      {@render tip()}
    </div>
  {/if}
</div>
