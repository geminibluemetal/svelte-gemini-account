<script>
  import Table from '$lib/components/Table.svelte';

  const headers = [
    { name: 'Time', key: 'token_time', align: 'center' },
    { name: 'Party', key: 'party_name' },
    { name: 'Item', key: 'item' },
    { name: 'Quantity', key: 'token_quantity', align: 'center' },
    { name: 'Vehicle', key: 'vehicle' }
  ];

  const a = {
    token_time: '02:37 AM',
    party_name: 'Ohm Muruga Construction',
    item: 'MS + Dust',
    token_quantity: '2.00',
    vehicle: '9553 G'
  };

  const items = Array.from({ length: 100 }).map((_) => a);
</script>

<Table title="Tokens" {headers} {items}></Table>
