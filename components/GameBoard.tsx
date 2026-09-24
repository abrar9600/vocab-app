'use client';

import React, { useState, useEffect } from 'react';

interface VocabPair {
  id: string;
  word: string;
  meaning: string;
}

interface Card {
  id: string;
  pairId: string;
  text: string;
  type: 'word' | 'meaning';
}

type Mode = 'select-mode' | 'matcher' | 'study';

export default function GameBoard() {
  const [mounted, setMounted] = useState(false);

  // Sheet Selection & Mode States
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [loadingSheets, setLoadingSheets] = useState<boolean>(true);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<Mode | null>(null);

  // Data States
  const [allPairs, setAllPairs] = useState<VocabPair[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Matcher Game States
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);

  const ITEMS_PER_PAGE = 5;

  // 1. Fetch available sheet tab names dynamically
  useEffect(() => {
    setMounted(true);

    async function fetchSheets() {
      try {
        setLoadingSheets(true);
        const res = await fetch('/api/vocab?action=getSheets');
        if (!res.ok) throw new Error('Failed to fetch available sheet tabs.');
        const data = await res.json();
        setAvailableSheets(data.sheets || []);
      } catch (err) {
        console.error('Error loading sheets:', err);
      } finally {
        setLoadingSheets(false);
      }
    }

    fetchSheets();
  }, []);

  // 2. Load pairs for a selected page segment
  const loadSegmentPage = (pageIndex: number, pairs: VocabPair[] = allPairs) => {
    if (!pairs || pairs.length === 0) return;

    setCurrentPage(pageIndex);

    const startIndex = (pageIndex - 1) * ITEMS_PER_PAGE;
    const selected = pairs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Shuffle English words for matcher column
    const wordCards: Card[] = selected
      .map((item) => ({
        id: `word-${item.id}`,
        pairId: item.id,
        text: item.word,
        type: 'word' as const,
      }))
      .sort(() => Math.random() - 0.5);

    // Shuffle Bengali meanings for matcher column
    const meaningCards: Card[] = selected
      .map((item) => ({
        id: `meaning-${item.id}`,
        pairId: item.id,
        text: item.meaning,
        type: 'meaning' as const,
      }))
      .sort(() => Math.random() - 0.5);

    setCards([...wordCards, ...meaningCards]);
    setSelectedCards([]);
    setMatchedIds([]);
  };

  // 3. Handle sheet click -> fetch data -> go to mode selection
  const handleSelectSheet = async (sheetName: string) => {
    try {
      setSelectedSheet(sheetName);
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/vocab?sheet=${encodeURIComponent(sheetName)}`);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const data = await res.json();
      const pairs: VocabPair[] = Array.isArray(data) ? data : data?.data || [];

      if (pairs.length === 0) {
        setError(`No vocabulary pairs found in '${sheetName}'.`);
      } else {
        setAllPairs(pairs);
        loadSegmentPage(1, pairs);
        setActiveMode('select-mode');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch words.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Matcher game click handler
  const handleCardClick = (card: Card) => {
    if (matchedIds.includes(card.pairId) || selectedCards.some((c) => c.id === card.id)) {
      return;
    }

    if (selectedCards.length === 0) {
      setSelectedCards([card]);
    } else if (selectedCards.length === 1) {
      const firstCard = selectedCards[0];
      setSelectedCards([firstCard, card]);

      if (firstCard.pairId === card.pairId && firstCard.type !== card.type) {
        setMatchedIds((prev) => [...prev, card.pairId]);
        setSelectedCards([]);
      } else {
        setTimeout(() => setSelectedCards([]), 800);
      }
    }
  };

  const renderCardButton = (card: Card) => {
    const isSelected = selectedCards.some((c) => c.id === card.id);
    const isMatched = matchedIds.includes(card.pairId);

    return (
      <button
        key={card.id}
        onClick={() => handleCardClick(card)}
        disabled={isMatched}
        className={`w-full p-4 rounded-xl border-2 text-center text-base font-semibold transition-all min-h-[70px] flex items-center justify-center shadow-sm ${
          isMatched
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-40 cursor-not-allowed'
            : isSelected
            ? 'bg-blue-600 border-blue-700 text-white shadow-md ring-4 ring-blue-200 scale-[1.02]'
            : 'bg-white border-slate-300 text-slate-900 hover:border-slate-500 hover:bg-slate-50 shadow-md'
        }`}
      >
        {card.text}
      </button>
    );
  };

  if (!mounted) return null;

  // VIEW 1: Sheet Selection Page
  if (!selectedSheet) {
    return (
      <div className="max-w-md mx-auto space-y-6 text-center py-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Choose Vocabulary Deck</h2>
          <p className="text-slate-600 text-sm">Select a Google Sheet tab to practice</p>
        </div>

        {loadingSheets ? (
          <div className="p-8 text-slate-500 font-medium animate-pulse">
            Fetching available tabs from Google Sheets...
          </div>
        ) : (
          <div className="space-y-3">
            {availableSheets.map((sheet) => (
              <button
                key={sheet}
                onClick={() => handleSelectSheet(sheet)}
                className="w-full p-4 rounded-xl border-2 border-slate-300 bg-white hover:border-blue-500 hover:bg-blue-50 font-bold text-slate-800 transition shadow-sm flex items-center justify-between"
              >
                <span>{sheet}</span>
                <span className="text-blue-600 text-sm">Select &rarr;</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // VIEW 2: Loading Game Data
  if (loading) {
    return (
      <div className="p-12 text-center text-slate-600 font-semibold text-lg animate-pulse">
        Loading deck "{selectedSheet}"...
      </div>
    );
  }

  // VIEW 3: Error State
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center space-y-4">
        <p className="font-bold text-lg">Unable to Load Vocabulary</p>
        <p className="text-sm font-mono">{error}</p>
        <button
          onClick={() => {
            setSelectedSheet(null);
            setActiveMode(null);
          }}
          className="bg-red-600 text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          Back to Sheet Selection
        </button>
      </div>
    );
  }

  // VIEW 4: Mode Choice Page (Study vs Matcher)
  if (activeMode === 'select-mode') {
    return (
      <div className="max-w-md mx-auto space-y-6 text-center py-8">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Selected Deck:
          </span>
          <h2 className="text-2xl font-bold text-slate-900">{selectedSheet}</h2>
          <p className="text-slate-600 text-sm">Choose how you want to practice</p>
        </div>

        <div className="space-y-4 pt-2">
          <button
            onClick={() => setActiveMode('study')}
            className="w-full p-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 hover:border-indigo-500 font-bold text-indigo-900 transition shadow-sm flex items-center justify-between text-left"
          >
            <div>
              <div className="text-lg">📖 Study Vocabs</div>
              <div className="text-xs font-normal text-indigo-600 mt-1">
                View 5 words with side-by-side meanings
              </div>
            </div>
            <span className="text-indigo-600 font-semibold text-sm">&rarr;</span>
          </button>

          <button
            onClick={() => setActiveMode('matcher')}
            className="w-full p-5 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 hover:border-emerald-500 font-bold text-emerald-900 transition shadow-sm flex items-center justify-between text-left"
          >
            <div>
              <div className="text-lg">🧩 Matcher Game</div>
              <div className="text-xs font-normal text-emerald-600 mt-1">
                Match words with their meanings
              </div>
            </div>
            <span className="text-emerald-600 font-semibold text-sm">&rarr;</span>
          </button>
        </div>

        <button
          onClick={() => {
            setSelectedSheet(null);
            setActiveMode(null);
          }}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline pt-4"
        >
          &larr; Choose Different Deck
        </button>
      </div>
    );
  }

  const totalPages = Math.ceil(allPairs.length / ITEMS_PER_PAGE);
  const currentSegmentPairs = allPairs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Common Header & Segment Navigation component
  const NavigationControls = () => (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center border-b pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Deck:
          </span>
          <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border text-sm">
            {selectedSheet}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-2">
            Mode:
          </span>
          <span className="font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200 text-sm">
            {activeMode === 'study' ? 'Study' : 'Matcher'}
          </span>
        </div>
        <button
          onClick={() => setActiveMode('select-mode')}
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          Switch Mode
        </button>
      </div>

      {/* Segment Selector Buttons */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
          Select Segment
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }, (_, idx) => {
            const pageNum = idx + 1;
            const startNum = (pageNum - 1) * ITEMS_PER_PAGE + 1;
            const endNum = Math.min(pageNum * ITEMS_PER_PAGE, allPairs.length);
            const isActive = currentPage === pageNum;

            return (
              <button
                key={pageNum}
                onClick={() => loadSegmentPage(pageNum)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  isActive
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-md'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                {startNum}–{endNum}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // VIEW 5: Study Vocabs Application
  if (activeMode === 'study') {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <NavigationControls />

        <div className="bg-slate-200/70 px-6 py-3 rounded-xl text-sm font-bold text-slate-800 border border-slate-300 text-center">
          Studying Segment {currentPage} of {totalPages} (Words {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, allPairs.length)})
        </div>

        {/* Study List Cards */}
        <div className="space-y-3">
          {currentSegmentPairs.map((pair, index) => (
            <div
              key={pair.id}
              className="grid grid-cols-2 gap-4 p-4 bg-white rounded-xl border-2 border-slate-200 shadow-sm items-center hover:border-slate-300 transition"
            >
              <div className="flex items-center space-x-3 border-r pr-3 border-slate-100">
                <span className="text-xs font-bold text-slate-400 w-5">
                  {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}.
                </span>
                <span className="text-base font-bold text-slate-900">{pair.word}</span>
              </div>
              <div className="text-base font-medium text-slate-700 pl-2">
                {pair.meaning}
              </div>
            </div>
          ))}
        </div>

        {/* Next Segment Footer Navigation */}
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => loadSegmentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 disabled:opacity-40"
          >
            &larr; Previous 5
          </button>
          <button
            onClick={() => loadSegmentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow hover:bg-blue-700 disabled:opacity-40"
          >
            Next 5 &rarr;
          </button>
        </div>
      </div>
    );
  }

  const isRoundComplete = cards.length > 0 && matchedIds.length === cards.length / 2;

  // VIEW 6: Vocabulary Matcher Application
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <NavigationControls />

      {/* Segment Status Header */}
      <div className="flex justify-between items-center bg-slate-200/70 px-6 py-3 rounded-xl text-sm font-bold text-slate-800 border border-slate-300">
        <span>Segment: {currentPage} of {totalPages}</span>
        <span>Matched: {matchedIds.length} / {cards.length / 2}</span>
      </div>

      {/* Two-Column Card Columns */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 text-center">
            English Words
          </h3>
          {cards
            .filter((c) => c.type === 'word')
            .map((card) => renderCardButton(card))}
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 text-center">
            Bengali Meanings
          </h3>
          {cards
            .filter((c) => c.type === 'meaning')
            .map((card) => renderCardButton(card))}
        </div>
      </div>

      {/* Round Completion Modal */}
      {isRoundComplete && (
        <div className="p-6 bg-emerald-600 text-white rounded-xl shadow-lg text-center space-y-4">
          <p className="text-xl font-bold">
            Segment {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, allPairs.length)} Completed!
          </p>
          <button
            onClick={() =>
              loadSegmentPage(currentPage < totalPages ? currentPage + 1 : 1)
            }
            className="bg-white text-emerald-800 font-bold px-6 py-2.5 rounded-lg hover:bg-slate-100 transition shadow"
          >
            {currentPage < totalPages ? 'Play Next Segment' : 'Restart From Beginning (1–5)'}
          </button>
        </div>
      )}
    </div>
  );
}