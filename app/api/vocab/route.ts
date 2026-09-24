import { NextResponse } from 'next/server';

// Published Document Key and Base URL
const PUBLISHED_KEY = '2PACX-1vRt0_4SQa0Xi2KU7b8K5u5cHJe09lQ78v-yFVJ2G1g4PVvc4VZ-AhMBQYJfdKheilKnNJrhdAybalaS';
const PUBLISHED_BASE_URL = `https://docs.google.com/spreadsheets/d/e/${PUBLISHED_KEY}`;

interface SheetMap {
  [sheetName: string]: string; // Maps sheet name -> sheet GID
}

let cachedSheetMap: SheetMap = {};

async function getSheetTabMap(): Promise<SheetMap> {
  const pubHtmlUrl = `${PUBLISHED_BASE_URL}/pubhtml`;

  const response = await fetch(pubHtmlUrl, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load published spreadsheet metadata.');
  }

  const htmlText = await response.text();
  const sheetMap: SheetMap = {};

  // Method 1: Extract sheet name and sheetId/gid pairs from Google's embedded JS configuration
  const nameGidMatches = [...htmlText.matchAll(/{\s*name:\s*["']([^"']+)["'][\s\S]*?gid:\s*["']?([0-9]+)["']?/g)];
  for (const match of nameGidMatches) {
    const name = match[1].trim();
    const gid = match[2];
    if (name && gid) sheetMap[name] = gid;
  }

  // Method 2: Fallback extraction from sheet tab button markup (e.g. <li id="sheet-button-123456"><a ...>Sheet Name</a>)
  const buttonMatches = [...htmlText.matchAll(/<li id="sheet-button-([0-9]+)"[^>]*><a[^>]*>(.*?)<\/a>/g)];
  for (const match of buttonMatches) {
    const gid = match[1];
    const name = match[2].trim();
    if (name && gid && !sheetMap[name]) {
      sheetMap[name] = gid;
    }
  }

  // Method 3: Fallback extraction from query parameters in tab links (e.g. pubhtml?gid=123456)
  const linkMatches = [...htmlText.matchAll(/gid=([0-9]+)[^>]*>(.*?)<\/a>/g)];
  for (const match of linkMatches) {
    const gid = match[1];
    const name = match[2].replace(/<[^>]+>/g, '').trim();
    if (name && gid && !sheetMap[name]) {
      sheetMap[name] = gid;
    }
  }

  // Clean HTML entities (e.g., &amp; -> &)
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

  cachedSheetMap = cleanedMap;
  return cleanedMap;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const sheetName = searchParams.get('sheet');

    // 1. Fetch available sheet tab names
    if (action === 'getSheets') {
      const tabMap = await getSheetTabMap();
      const sheetNames = Object.keys(tabMap);

      return NextResponse.json({
        sheets: sheetNames.length > 0 ? sheetNames : ['Repeat Vocabs'],
      });
    }

    // 2. Fetch CSV rows for the requested sheet using its unique GID
    const targetSheet = sheetName || 'Repeat Vocabs';

    // Fetch tab map if target sheet GID isn't found in memory cache
    let tabMap = cachedSheetMap;
    if (!tabMap[targetSheet]) {
      tabMap = await getSheetTabMap();
    }

    const gid = tabMap[targetSheet] || '0';
    const csvUrl = `${PUBLISHED_BASE_URL}/pub?output=csv&gid=${gid}`;

    const response = await fetch(csvUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV for tab "${targetSheet}" (GID: ${gid}).`);
    }

    const csvText = await response.text();

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