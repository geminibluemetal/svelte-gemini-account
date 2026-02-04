<script>
  import { CashTable } from '$lib/components/Table.svelte';

  const a = {
    time: '02:30 AM',
    serial: '12',
    description: 'Stock yesterday',
    amount: '1888',
    sign: '0'
  };

  const income = Array.from({ length: 200 }).map((_) => a);
  const expense = Array.from({ length: 10 }).map((_) => a);
</script>

<CashTable title="Cash Report" {income} {expense} moveToEnd={true}></CashTable>
