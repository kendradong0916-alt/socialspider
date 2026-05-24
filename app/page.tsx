import Link from 'next/link';

const FEATURES = [
  {
    icon: '🌐',
    title: 'Any Website',
    desc: 'Point Skyvern at any URL. No selectors, no scripts — just natural language.',
  },
  {
    icon: '👁️',
    title: 'Live Browser View',
    desc: 'Watch every click and keystroke as the AI agent navigates in real time.',
  },
  {
    icon: '🗄️',
    title: 'Supabase Persistence',
    desc: 'Every task, step, and result is stored and queryable via Supabase.',
  },
  {
    icon: '🚀',
    title: 'One-click Deploy',
    desc: 'Fully Vercel-compatible. No servers to manage — push and go.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-gray-900">Skyvern MVP</span>
          <Link
            href="/tasks"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Open Dashboard →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Powered by Skyvern + Supabase
        </div>

        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight max-w-2xl">
          Automate Any Website with{' '}
          <span className="text-blue-600">Natural Language</span>
        </h1>

        <p className="mt-5 text-lg text-gray-500 max-w-xl">
          Describe what you want — Skyvern handles the browser, you watch it live,
          and every result lands in Supabase.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/tasks"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            Start a Task →
          </Link>
          <a
            href="https://docs.skyvern.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors text-sm"
          >
            Skyvern Docs
          </a>
        </div>

        {/* Features */}
        <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl w-full text-left">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-xl border border-gray-200 bg-white"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-20 max-w-2xl w-full text-left">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">How it works</h2>
          <div className="space-y-4">
            {[
              ['1. Enter URL + task', 'Paste any website URL and describe your goal in plain English.'],
              ['2. Skyvern runs in the cloud', 'A real Chromium browser navigates, fills forms, extracts data.'],
              ['3. Watch it live', 'Screenshots stream back every 2 seconds so you see exactly what\'s happening.'],
              ['4. Results in Supabase', 'Extracted data and task history are persisted for querying or export.'],
            ].map(([title, body]) => (
              <div key={title} className="flex gap-4 p-4 rounded-xl bg-white border border-gray-200">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        Built with{' '}
        <a href="https://skyvern.com" className="underline hover:text-gray-600" target="_blank" rel="noopener noreferrer">Skyvern</a>
        {' '}+{' '}
        <a href="https://supabase.com" className="underline hover:text-gray-600" target="_blank" rel="noopener noreferrer">Supabase</a>
        {' '}· Deploy on{' '}
        <a href="https://vercel.com" className="underline hover:text-gray-600" target="_blank" rel="noopener noreferrer">Vercel</a>
      </footer>
    </div>
  );
}
