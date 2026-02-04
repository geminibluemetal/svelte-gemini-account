<script>
  import Table from '$lib/components/Table.svelte';

  const headers = [
    { name: 'Name', align: 'left', key: 'name' },
    { name: 'Phone', align: 'center', key: 'phone' },
    { name: 'Balance', align: 'center', key: 'balance' }
  ];

  const a = {
    name: 'Seeni',
    phone: '7868981120',
    balance: 5000
  };

  const items = Array.from({ length: 100 }).map((_) => a);
</script>

<Table title="Party List" {headers} {items}></Table>
