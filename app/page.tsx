import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
      <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
        Master Your Vocabulary
      </h1>
      
      <p className="max-w-xl text-lg text-slate-600">
        Practice and strengthen your vocabulary with interactive word-to-definition matching. 
        Select vocabulary sets directly connected to your structured study sheets.
      </p>

      <div className="pt-4">
        <Link
          href="/matcher"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
        >
          Open Vocabulary Matcher
        </Link>
      </div>
    </div>
  );
}