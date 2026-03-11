import CashService from '$lib/features/cash/CashService.js';
import { getFormattedDate } from '$lib/utils/dateTime.js';

export async function GET({ url }) {
  const type = url.searchParams.get('type');
  const cashService = new CashService();
  const result = await cashService.getAdvanceCashForAttendance(type);

  const data = {};

  result.forEach((r) => {
    const date = getFormattedDate(r.createdAt);
    const description = r.description.replace(/Cleaner|Driver|Crusher/g, '').trim();
    if (!data[date]) data[date] = [];
    data[date].push(`${description} - ${r.amount}`);
  });

  let response = '';

  Object.entries(data).forEach(([date, amounts]) => {
    response += `${date}\n`;
    amounts.forEach((amount) => {
      response += `${amount}\n`;
    });
    response += `\n`;
  });

  return new Response(response, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
