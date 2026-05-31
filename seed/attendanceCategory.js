// seed/attendanceCategory.js
export const collectionName = 'attendanceCategory';

export const seedData = [
  {
    name: 'Jelly Driver',
    fields: [
      { shortName: 'T', longName: 'Jelly Tip', amount: 60, id: crypto.randomUUID() },
      { shortName: 'W', longName: 'Water Tip', amount: 40, id: crypto.randomUUID() },
    ],
    calculationRule: [
      { name: "Working Days", key: "workingDays", rule: "SUM:AT", id: crypto.randomUUID() },
      { name: "Tip Loads", key: "tipLoads", rule: "SUM:T", id: crypto.randomUUID() },
      { name: "Water Loads", key: "waterLoads", rule: "SUM:W", id: crypto.randomUUID() },
      // { name: "Mayil Loads", key: "mayilLoads", rule: "SUM:M", id: crypto.randomUUID() },

      { name: "Day Fees", key: "dayFees", rule: "nd:dayFee", id: crypto.randomUUID() },
      { name: "Tip Amount", key: "tipAmount", rule: "cl:tipLoads*fd:T", id: crypto.randomUUID() },
      // { name: "Mayil Amount", key: "mayilAmount", rule: "cl:mayilLoads*fd:M", id: crypto.randomUUID() },
      { name: "Water Amount", key: "waterAmount", rule: "cl:waterLoads*fd:W", id: crypto.randomUUID() },

      { name: "Salary", key: "salary", rule: "cl:workingDays*nd:dayFee", id: crypto.randomUUID() },
      { name: "Total Tip Amount", key: "totalTipAmount", rule: "cl:tipAmount+cl:waterAmount", id: crypto.randomUUID() },
      // { name: "Total Tip Amount", key: "totalTipAmount", rule: "cl:tipAmount+cl:mayilAmount", id: crypto.randomUUID() },
      { name: "Total Salary", key: "totalSalary", rule: "cl:salary+cl:totalTipAmount", id: crypto.randomUUID() },
      { name: "Total Advance", key: "totalAdvance", rule: "SUM:Adv", id: crypto.randomUUID() },
      { name: "Payable Amount", key: "payableAmount", rule: "cl:totalSalary-cl:totalAdvance", id: crypto.randomUUID() },
    ],
  },
  {
    name: 'Chakka Driver',
    fields: [
      { shortName: 'T', longName: 'Jelly Taras Tip', amount: 100, id: crypto.randomUUID() },
      { shortName: 'M', longName: 'Mayil Tip', amount: 25, id: crypto.randomUUID() },
    ],
    calculationRule: [
      { name: "Working Days", key: "workingDays", rule: "SUM:AT", id: crypto.randomUUID() },
      { name: "Tip Loads", key: "tipLoads", rule: "SUM:T", id: crypto.randomUUID() },
      // { name: "Water Loads", key: "waterLoads", rule: "SUM:W", id: crypto.randomUUID() },
      { name: "Mayil Loads", key: "mayilLoads", rule: "SUM:M", id: crypto.randomUUID() },

      { name: "Day Fees", key: "dayFees", rule: "nd:dayFee", id: crypto.randomUUID() },
      { name: "Tip Amount", key: "tipAmount", rule: "cl:tipLoads*fd:T", id: crypto.randomUUID() },
      { name: "Mayil Amount", key: "mayilAmount", rule: "cl:mayilLoads*fd:M", id: crypto.randomUUID() },
      // { name: "Water Amount", key: "waterAmount", rule: "cl:waterLoads*fd:W", id: crypto.randomUUID() },

      { name: "Salary", key: "salary", rule: "cl:workingDays*nd:dayFee", id: crypto.randomUUID() },
      // { name: "Total Tip Amount", key: "totalTipAmount", rule: "cl:tipAmount+cl:waterAmount", id: crypto.randomUUID() },
      { name: "Total Tip Amount", key: "totalTipAmount", rule: "cl:tipAmount+cl:mayilAmount", id: crypto.randomUUID() },
      { name: "Total Salary", key: "totalSalary", rule: "cl:salary+cl:totalTipAmount", id: crypto.randomUUID() },
      { name: "Total Advance", key: "totalAdvance", rule: "SUM:Adv", id: crypto.randomUUID() },
      { name: "Payable Amount", key: "payableAmount", rule: "cl:totalSalary-cl:totalAdvance", id: crypto.randomUUID() },
    ],
  },
  {
    name: 'Cleaner',
    fields: [
      { shortName: 'T', longName: 'Jelly Tip', amount: 60, id: crypto.randomUUID() },
      { shortName: 'W', longName: 'Water Tip', amount: 40, id: crypto.randomUUID() },
    ],
    calculationRule: [
      { name: "Working Days", key: "workingDays", rule: "SUM:AT", id: crypto.randomUUID() },
      { name: "Tip Loads", key: "tipLoads", rule: "SUM:T", id: crypto.randomUUID() },
      { name: "Water Loads", key: "waterLoads", rule: "SUM:W", id: crypto.randomUUID() },
      // { name: "Mayil Loads", key: "mayilLoads", rule: "SUM:M", id: crypto.randomUUID() },

      { name: "Day Fees", key: "dayFees", rule: "nd:dayFee", id: crypto.randomUUID() },
      { name: "Tip Amount", key: "tipAmount", rule: "cl:tipLoads*fd:T", id: crypto.randomUUID() },
      // { name: "Mayil Amount", key: "mayilAmount", rule: "cl:mayilLoads*fd:M", id: crypto.randomUUID() },
      { name: "Water Amount", key: "waterAmount", rule: "cl:waterLoads*fd:W", id: crypto.randomUUID() },

      { name: "Salary", key: "salary", rule: "cl:workingDays*nd:dayFee", id: crypto.randomUUID() },
      { name: "Total Tip Amount", key: "totalTipAmount", rule: "cl:tipAmount+cl:waterAmount", id: crypto.randomUUID() },
      // { name: "Total Tip Amount", key: "totalTipAmount", rule: "cl:tipAmount+cl:mayilAmount", id: crypto.randomUUID() },
      { name: "Total Salary", key: "totalSalary", rule: "cl:salary+cl:totalTipAmount", id: crypto.randomUUID() },
      { name: "Total Advance", key: "totalAdvance", rule: "SUM:Adv", id: crypto.randomUUID() },
      { name: "Payable Amount", key: "payableAmount", rule: "cl:totalSalary-cl:totalAdvance", id: crypto.randomUUID() },
    ],
  },
  {
    name: 'Crusher Operator',
    fields: [],
    calculationRule: [
      { name: "Working Days", key: "workingDays", rule: "SUM:AT", id: crypto.randomUUID() },
      { name: "Day Fees", key: "dayFees", rule: "nd:dayFee", id: crypto.randomUUID() },
      { name: "Total Salary", key: "totalSalary", rule: "cl:workingDays*nd:dayFee", id: crypto.randomUUID() },
      { name: "Total Advance", key: "totalAdvance", rule: "SUM:Adv", id: crypto.randomUUID() },
      { name: "Payable Amount", key: "payableAmount", rule: "cl:totalSalary-cl:totalAdvance", id: crypto.randomUUID() },
    ],
  },
  {
    name: 'Crusher Helper',
    fields: [
      { shortName: 'F', longName: 'Food Fees', amount: 25, id: crypto.randomUUID(), isHidden: true },
    ],
    calculationRule: [
      { name: "Working Days", key: "workingDays", rule: "SUM:AT", id: crypto.randomUUID() },
      { name: "Food Fees", key: "foodFees", rule: "CEIL:SUM:AT*fd:F", id: crypto.randomUUID() },
      { name: "Day Fees", key: "dayFees", rule: "nd:dayFee", id: crypto.randomUUID() },
      { name: "Salary", key: "salary", rule: "cl:workingDays*nd:dayFee", id: crypto.randomUUID() },
      { name: "Total Salary", key: "totalSalary", rule: "cl:salary+cl:foodFees", id: crypto.randomUUID() },
      { name: "Total Advance", key: "totalAdvance", rule: "SUM:Adv", id: crypto.randomUUID() },
      { name: "Payable Amount", key: "payableAmount", rule: "cl:totalSalary-cl:totalAdvance", id: crypto.randomUUID() },
    ],
  },
];
