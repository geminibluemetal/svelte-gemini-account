// seed/attendanceCategory.js
export const collectionName = 'attendanceCategory';

export const seedData = [
  {
    name: 'Jelly Driver',
    fields: [
      { shortName: 'T', longName: 'Jelly Tip', amount: 60, id: crypto.randomUUID() },
      { shortName: 'W', longName: 'Water Tip', amount: 40, id: crypto.randomUUID() },
    ],
  },
  {
    name: 'Chakka Driver',
    fields: [
      { shortName: 'T', longName: 'Jelly Taras Tip', amount: 100, id: crypto.randomUUID() },
      { shortName: 'M', longName: 'Mayil Tip', amount: 25, id: crypto.randomUUID() },
    ],
  },
  {
    name: 'Cleaner',
    fields: [
      { shortName: 'T', longName: 'Jelly Tip', amount: 60, id: crypto.randomUUID() },
      { shortName: 'W', longName: 'Water Tip', amount: 40, id: crypto.randomUUID() },
    ],
  },
  {
    name: 'Crusher Operator',
    fields: [],
  },
  {
    name: 'Crusher Helper',
    fields: [],
  },
];
