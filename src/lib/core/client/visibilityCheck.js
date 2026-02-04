export const isElementVisible = (element, container) => {
  if (!element || !container) return false;

  const elementTop = element.offsetTop - container.offsetTop;
  const elementBottom = elementTop + element.offsetHeight;
  const containerTop = container.scrollTop;
  const containerBottom = containerTop + container.clientHeight;

  // Check if element is at least partially visible
  return elementBottom > containerTop && elementTop < containerBottom;
};

// Check if element is fully visible
export const isElementFullyVisible = (element, container, offset = { top: 0 }) => {
  if (!element || !container) return false;

  const elementTop = element.offsetTop - container.offsetTop - offset.top;
  const elementBottom = elementTop + element.offsetHeight + offset.top;
  const containerTop = container.scrollTop;
  const containerBottom = containerTop + container.clientHeight;

  return elementTop >= containerTop && elementBottom <= containerBottom;
};

// Check if element is partially visible (at least X% visible)
export const isElementPartiallyVisible = (element, container, minPercentage = 0.1) => {
  if (!element || !container) return false;

  const elementTop = element.offsetTop - container.offsetTop;
  const elementBottom = elementTop + element.offsetHeight;
  const containerTop = container.scrollTop;
  const containerBottom = containerTop + container.clientHeight;

  // Calculate visible height
  const visibleTop = Math.max(elementTop, containerTop);
  const visibleBottom = Math.min(elementBottom, containerBottom);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);

  const percentageVisible = visibleHeight / element.offsetHeight;

  return percentageVisible >= minPercentage;
};

export const scrollToMiddle = (element, container) => {
  if (!element || !container) return;

  // Calculate element position relative to container
  const elementTop = element.offsetTop - container.offsetTop;
  const elementHeight = element.offsetHeight;
  const containerHeight = container.clientHeight;

  // Calculate scroll position to center the element
  const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2);

  // Apply scroll with optional smooth behavior
  container.scrollTo({
    top: scrollPosition,
  });
};