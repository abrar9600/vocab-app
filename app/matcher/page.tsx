import GameBoard from '@/components/GameBoard';

export default function MatcherPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="border-b border-slate-200 pb-4 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Vocabulary Matcher
          </h1>
          <p className="text-slate-600 mt-1 text-sm">
            Match each English word with its correct Bengali meaning. Select a card to begin!
          </p>
        </header>

        <GameBoard />
      </div>
    </main>
  );
}