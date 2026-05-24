'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const EXAMPLES = [
  {
    url: 'https://news.ycombinator.com',
    prompt: 'Find the top 5 posts on the front page and return their titles and point counts.',
  },
  {
    url: 'https://github.com/trending',
    prompt: 'List the top 3 trending repositories today with their star counts and descriptions.',
  },
  {
    url: 'https://quotes.toscrape.com',
    prompt: 'Extract the first 5 quotes with their authors and tags.',
  },
];

export function CreateTaskForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), prompt: prompt.trim() }),
      });

      let data: { id?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        setError(`Server error (${res.status}) — check Vercel environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)`);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? `Server error ${res.status}`);
        return;
      }

      router.push(`/tasks/${data.id}`);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const fillExample = (ex: (typeof EXAMPLES)[number]) => {
    setUrl(ex.url);
    setPrompt(ex.prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Target URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
          disabled={loading}
          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
        />
      </div>

      {/* Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Task Instructions
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what Skyvern should do on this page…"
          required
          disabled={loading}
          rows={4}
          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !url.trim() || !prompt.trim()}
        className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Creating task…
          </>
        ) : (
          'Run Task with Skyvern →'
        )}
      </button>

      {/* Examples */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Try an example:</p>
        <div className="flex flex-col gap-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => fillExample(ex)}
              className="text-left text-xs px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <span className="font-medium text-gray-700">{ex.url}</span>
              <span className="text-gray-500"> — {ex.prompt.slice(0, 60)}…</span>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
