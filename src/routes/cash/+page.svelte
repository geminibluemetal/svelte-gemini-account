<script>
  import CashTable from '$lib/components/CashTable.svelte';

  const a = {
    time: '02:30 AM',
    serial: '12',
    description: 'Stock yesterday',
    amount: '1888',
    sign: '0'
  };

  const incomeHeader = [
    { name: 'Time', align: 'center', key: 'time', width: '80' },
    { name: 'SN', align: 'center', key: 'serial', width: '35' },
    { name: 'Description', align: 'left', key: 'description', width: '250' },
    { name: 'Amount', align: 'right', key: 'amount' },
    { name: 'Sign', align: 'center', key: 'sign' }
  ];

  const expenseHeader = [
    { name: 'Time', align: 'center', key: 'time', width: '80' },
    { name: 'SN', align: 'center', key: 'serial', width: '35' },
    { name: 'Description', align: 'left', key: 'description', width: '250' },
    { name: 'Amount', align: 'right', key: 'amount' },
    { name: 'Sign', align: 'center', key: '0' }
  ];

  const income = Array.from({ length: 200 }).map((_) => a);
  const expense = Array.from({ length: 10 }).map((_) => a);
</script>

<CashTable
  title="Cash Report"
  {income}
  {expense}
  {incomeHeader}
  {expenseHeader}
  moveToEnd={true}
  hideSerial={true}
  hideAction={true}
></CashTable>
