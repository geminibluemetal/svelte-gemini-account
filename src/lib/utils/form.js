// src\lib\utils\form.js

export function formDataToObject(formData) {
  const result = {};

  for (const [key, value] of formData) {
    const path = getPathFromKey(key);
    setValue(result, path, value);
  }

  return result;
}

function getPathFromKey(key) {
  // "phone[0][name]" → ["phone", 0, "name"]
  // "tags[]" → ["tags", null]
  return key
    .replace(/\]/g, '')
    .split('[')
    .map(part =>
      part === '' ? null : isNaN(part) ? part : Number(part)
    );
}

function setValue(target, path, value) {
  let current = target;

  path.forEach((key, index) => {
    const isLast = index === path.length - 1;
    const nextKey = path[index + 1];

    if (isLast) {
      if (key === null) {
        current.push(value);
      } else if (current[key] !== undefined) {
        current[key] = [].concat(current[key], value);
      } else {
        current[key] = normalizeValue(value);
      }
      return;
    }

    if (key === null) {
      const container = isArray(nextKey) ? [] : {};
      current.push(container);
      current = container;
      return;
    }

    if (!(key in current)) {
      current[key] = isArray(nextKey) ? [] : {};
    }

    current = current[key];
  });
}

function isArray(value) {
  return value === null || typeof value === 'number';
}

function normalizeValue(value) {
  if (value === 'on') return true;
  if (value === 'off') return false;
  if (value === 'true') return true;
  if (value === 'false') return false;

  return value;
}