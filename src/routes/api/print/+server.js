import { printOut } from '$lib/core/server/print';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const data = await request.json();

  printOut((p) => {
    p.reset()
      .beepOn(1, 5)
      .align('center')
      .setTextSize(1, 0)
      .bold(true);

    // 1. Process Title
    if (data.titles.length)
      data.titles.forEach(t => p.line(t))

    p.setTextSize(0, 0);

    // 2. Process Description
    if (data.descriptions.length)
      data.descriptions.forEach(d => p.line(d))

    p.setTextSize(1, 0)
      .bold(false)
      .dashedLine(17)
      .align('left');

    // 3. Process paris data
    if (data.pairs.length)
      data.pairs.forEach(r => p.pairs(r.name, r.value));

    // Footer
    p.flushPairs().feed(1).cut();
  });

  return json({ status: 'ok' });
}