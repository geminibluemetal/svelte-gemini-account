<script>
  import { Table } from '$lib';

  const headers = [
    { name: 'Name', align: 'left', key: 'name' },
    { name: '0.25', align: 'right', key: 'price_025' },
    { name: '0.50', align: 'right', key: 'price_050' },
    { name: '1.00', align: 'right', key: 'price_100' },
    { name: '1.50', align: 'right', key: 'price_150' },
    { name: '2.00', align: 'right', key: 'price_200' }
  ];

  const a = {
    name: 'KunthaniMedu',
    price_025: 300,
    price_050: 300,
    price_100: 300,
    price_150: 300,
    price_200: 300
  };

  const items = Array.from({ length: 100 }).map((_) => a);
</script>

<Table title="Items List" {headers} {items}></Table>
