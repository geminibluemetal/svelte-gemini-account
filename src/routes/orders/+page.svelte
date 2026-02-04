<script>
  import Table from '$lib/components/Table.svelte';

  const headers = [
    { name: 'Date', align: 'left', key: 'date' },
    { name: 'ON', align: 'left', key: 'order_number' },
    { name: 'Party', align: 'left', key: 'party' },
    { name: 'Address', align: 'right', key: 'address' },
    { name: 'Phone', align: 'right', key: 'phone' },
    { name: 'Item', align: 'right', key: 'item' },
    { name: 'T Qty', align: 'right', key: 'total_qty' },
    { name: 'AT', align: 'right', key: 'amount_type' },
    { name: 'Amt', align: 'right', key: 'amount' },
    { name: 'Adv', align: 'right', key: 'advance' },
    { name: 'Dis', align: 'right', key: 'discount' },
    { name: 'Bal', align: 'right', key: 'balance' },
    { name: 'Sign', align: 'right', key: 'sign' },
    { name: 'D Qty', align: 'right', key: 'delivered_qty' },
    { name: 'B Qty', align: 'right', key: 'balance_qty' },
    { name: 'Notes', align: 'right', key: 'notes' },
    // { name: 'Status', align: 'right', key: 'status' },
    { name: 'DSV', align: 'right', key: 'delivery_sheet_verified' }
  ];

  const a = {
    name: 'Ohm Muruga Construction',
    date: '23-06-2000',
    order_number: '888',
    party: 'Ohm Muruga Construction',
    address: 'Velthigamanibenta',
    phone: '9876543210',
    item: '12mm+6mm',
    total_qty: '10.00',
    amount_type: 'COD',
    amount: '12345',
    advance: '12345',
    discount: '12345',
    balance: '12345',
    sign: '0',
    delivered_qty: '5.00',
    balance_qty: '5.00',
    notes: 'T (2+2) somthigg text here',
    status: 'Delivered',
    delivery_sheet_verified: '5'
  };

  const items = Array.from({ length: 100 }).map((_) => a);
</script>

<Table title="Order Book" {headers} {items} hideSerial={true}></Table>
