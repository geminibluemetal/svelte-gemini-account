import CashService from '$lib/features/cash/CashService.js';
import { getFormattedDate } from '$lib/utils/dateTime.js';

export async function GET({ url }) {
  const type = url.searchParams.get('type')
  const cashService = new CashService()
  const result = await cashService.getAdvanceCashForAttendance(type)
  const data = {}
  result.map(r => {
    const date = getFormattedDate(r.createdAt)
    if (Array.isArray(data[date])) {
      data[date] = `${r.description.replaceAll(['Cleaner', 'Driver', 'Crusher'], '')} - ${r.amount}`
    }
  })
  console.log(data)
  return new Response(JSON.stringify({ name: "Gemini" }), {
    headers: { "Content-Type": "application/json" }
  });
}