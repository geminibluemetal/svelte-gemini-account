// seed/attendanceCategory.js
export const collectionName = 'attendanceCategory';

export const seedData = [
  {
    name: 'Jelly Driver',
    fields: [
      { shortName: 'T', longName: 'Jelly Tip', amount: 60 },
      { shortName: 'W', longName: 'Water Tip', amount: 40 },
    ],
  },
  {
    name: 'Chakka Driver',
    fields: [
      { shortName: 'T', longName: 'Jelly Taras Tip', amount: 100 },
      { shortName: 'M', longName: 'Mayil Tip', amount: 25 },
    ],
  },
  {
    name: 'Cleaner',
    fields: [
      { shortName: 'T', longName: 'Jelly Tip', amount: 60 },
      { shortName: 'W', longName: 'Water Tip', amount: 40 },
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
