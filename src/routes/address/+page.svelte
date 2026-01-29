<script>
  import { Table } from '$lib';

  const headers = [
    { name: 'Name', align: 'left', key: 'name' },
    { name: '0.25', align: 'right', key: 'delivery_025' },
    { name: '0.50 and 1.00', align: 'right', key: 'delivery_050_100' },
    { name: '1.50', align: 'right', key: 'delivery_150' },
    { name: '2.00 and Max', align: 'right', key: 'delivery_200_max' }
  ];

  const a = {
    name: 'KunthaniMedu',
    delivery_025: 1000,
    delivery_050_100: 1000,
    delivery_150: 1000,
    delivery_200_max: 1000
  };

  const items = Array.from({ length: 100 }).map((_) => a);
</script>

<Table title="Address List" {headers} {items}></Table>
