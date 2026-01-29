<script>
  import { Table } from '$lib';

  const headers = [
    { name: 'Name', align: 'left', key: 'name' },
    { name: 'Phone', align: 'center', key: 'phone' }
  ];

  const a = {
    name: 'Seeni',
    phone: '7868981120'
  };

  const items = Array.from({ length: 50 }).map((_) => a);
</script>

<Table title="Party List" {headers} {items}></Table>
