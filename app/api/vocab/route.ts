import { NextResponse } from 'next/server';

const PUBLISHED_KEY = '2PACX-1vRt0_4SQa0Xi2KU7b8K5u5cHJe09lQ78v-yFVJ2G1g4PVvc4VZ-AhMBQYJfdKheilKnNJrhdAybalaS';
const PUBLISHED_BASE_URL = `https://docs.google.com/spreadsheets/d/e/${PUBLISHED_KEY}`;

interface SheetMap {
  [sheetName: string]: string;
}

let cachedSheetMap: SheetMap = {};

// Helper function to fetch external URLs with retries
async function fetchWithRetry(url: string, retries = 2, delayMs = 500): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (Next.js Serverless Fetch)',
        },
      });

      if (response.ok) return response;
    } catch (err) {
      if (i === retries) throw err;
    }
    // Wait brief delay before retrying
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error(`Failed to fetch from ${url} after ${retries + 1} attempts.`);
}

async function getSheetTabMap(): Promise<SheetMap> {
  try {
    const pubHtmlUrl = `${PUBLISHED_BASE_URL}/pubhtml`;
    const response = await fetchWithRetry(pubHtmlUrl);
    const htmlText = await response.text();
    const sheetMap: SheetMap = {};

    // Pattern 1: Inline JS configuration mapping
    const jsMatches = [...htmlText.matchAll(/{\s*name:\s*["']([^"']+)["'][\s\S]*?(?:gid|sheetId):\s*["']?([0-9]+)["']?/g)];
    for (const match of jsMatches) {
      if (match[1] && match[2]) sheetMap[match[1].trim()] = match[2];
    }

    // Pattern 2: Sheet tab button elements
    const buttonMatches = [...htmlText.matchAll(/<li id="sheet-button-([0-9]+)"[^>]*><a[^>]*>(.*?)<\/a>/g)];
    for (const match of buttonMatches) {
      const name = match[2].replace(/<[^>]+>/g, '').trim();
      if (name && match[1] && !sheetMap[name]) sheetMap[name] = match[1];
    }

    // Pattern 3: Query link parameters
    const linkMatches = [...htmlText.matchAll(/gid=([0-9]+)[^>]*>(.*?)<\/a>/g)];
    for (const match of linkMatches) {
      const name = match[2].replace(/<[^>]+>/g, '').trim();
      if (name && match[1] && !sheetMap[name]) sheetMap[name] = match[1];
    }

    // Sanitize HTML entities
    const cleanedMap: SheetMap = {};
    for (const [rawName, gid] of Object.entries(sheetMap)) {
      const cleanName = rawName
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      cleanedMap[cleanName] = gid;
    }

    if (Object.keys(cleanedMap).length > 0) {
      cachedSheetMap = cleanedMap;
    }

    return cachedSheetMap;
  } catch (error) {
    console.error('Error parsing sheet metadata:', error);
    return cachedSheetMap;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const sheetName = searchParams.get('sheet');

    // 1. Action: Get list of available sheet tabs
    if (action === 'getSheets') {
      const tabMap = await getSheetTabMap();
      const sheetNames = Object.keys(tabMap);

      return NextResponse.json({
        sheets: sheetNames.length > 0 ? sheetNames : ['Repeat Vocabs'],
      });
    }

    // 2. Fetch vocabulary CSV data for target sheet
    const targetSheet = sheetName || 'Repeat Vocabs';

    let tabMap = cachedSheetMap;
    if (!tabMap[targetSheet]) {
      tabMap = await getSheetTabMap();
    }

    const gid = tabMap[targetSheet] || '0';

    // Primary CSV endpoint
    const csvUrl = `${PUBLISHED_BASE_URL}/pub?output=csv&gid=${gid}`;
    let csvText = '';

    try {
      const response = await fetchWithRetry(csvUrl);
      csvText = await response.text();
    } catch {
      // Fallback CSV endpoint if pub?output=csv is throttled
      const fallbackUrl = `${PUBLISHED_BASE_URL}/pub?gid=${gid}&single=true&output=csv`;
      const fallbackResponse = await fetchWithRetry(fallbackUrl);
      csvText = await fallbackResponse.text();
    }

    const rows = csvText
      .split('\n')
      .map((row) => row.split(',').map((val) => val.trim().replace(/^["']|["']$/g, '')));

    const headers = rows[0]?.map((h) => h.toLowerCase()) || [];
    const wordIndex = headers.indexOf('word');
    const meaningIndex = headers.indexOf('meaning');

    if (wordIndex === -1 || meaningIndex === -1) {
      return NextResponse.json(
        { error: `Columns 'word' and 'meaning' not found in tab '${targetSheet}'.` },
        { status: 400 }
      );
    }

    const vocabList = rows
      .slice(1)
      .filter((row) => row[wordIndex] && row[meaningIndex])
      .map((row, index) => ({
        id: String(index + 1),
        word: row[wordIndex],
        meaning: row[meaningIndex],
      }));

    return NextResponse.json(vocabList);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}