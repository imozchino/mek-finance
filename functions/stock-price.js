const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const symbols = url.searchParams.get('symbols') || '';
  if (!symbols) {
    return new Response(JSON.stringify({}), { headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  const symbolList = symbols.split(',').map(s => s.trim()).filter(Boolean);
  const result = {};

  await Promise.all(symbolList.map(async (symbol) => {
    try {
      const r = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
        { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }
      );
      if (!r.ok) return;
      const d = await r.json();
      const price = d?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price && price > 0) {
        // Strip .BK suffix so key matches holding ticker
        const key = symbol.toUpperCase().endsWith('.BK') ? symbol.slice(0, -3) : symbol;
        result[key] = price;
      }
    } catch (e) {}
  }));

  return new Response(JSON.stringify(result), {
    headers: {
      ...CORS,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=900',
    },
  });
}
