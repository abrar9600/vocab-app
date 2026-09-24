import Link from 'next/link';  // changes the pages without refreshing the whole pages

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-wide hover:text-blue-400 transition">
          VocabApp
        </Link>
        <div className="flex gap-6 font-medium">
          <Link href="/" className="hover:text-blue-400 transition">
            Home
          </Link>
          <Link href="/matcher" className="hover:text-blue-400 transition">
            Vocabulary Matcher
          </Link>
        </div>
      </div>
    </nav>
  );
}