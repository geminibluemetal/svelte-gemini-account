<script>
  import Table from '$lib/components/Table.svelte';

  const headers = [
    { name: 'T Time', key: 'token_time', align: 'center' },
    { name: 'Vehicle', key: 'vehicle' },
    { name: 'D Time', key: 'delivery_time', align: 'center' },
    { name: 'ON', key: 'order_number', align: 'center' },
    { name: 'Party', key: 'party_name' },
    { name: 'Address', key: 'address' },
    { name: 'Item', key: 'item' },
    { name: 'Qty', key: 'delivered_quantity', align: 'center' },
    { name: 'AT1', key: 'amount_type_1', align: 'center' },
    { name: 'Amount1', key: 'amount_1', align: 'center' },
    { name: 'AT2', key: 'amount_type_2', align: 'center' },
    { name: 'Amount2', key: 'amount_2', align: 'center' },
    { name: 'Sign', key: 'owner_sign', align: 'center' }
  ];

  const a = {
    token_time: '02:30 AM',
    vehicle: '9553 G',
    delivery_time: '3:00 AM',
    order_number: '888',
    party_name: 'Ohm Muruga Construction',
    address: 'VelthigamaniBenta',
    item: 'MS + Dust',
    delivered_quantity: '2.00',
    amount_type_1: 'CP',
    amount_1: '2000',
    amount_type_2: 'Paytm',
    amount_2: '3000',
    owner_sign: '0'
  };

  const items = Array.from({ length: 200 }).map((_) => a);
</script>

<Table title="Delivery Sheet" {headers} {items} moveToEnd={true}></Table>
