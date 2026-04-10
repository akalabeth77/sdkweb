"use client";

import { useEffect, useState } from 'react';

interface Quote {
  quote: string;
  author: string;
  date: string;
}

export function DailyQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuote() {
      try {
        const response = await fetch('/api/quotes/daily');
        if (response.ok) {
          const data = await response.json();
          setQuote(data);
        }
      } catch (error) {
        console.error('Failed to fetch daily quote:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuote();
  }, []);

  if (loading || !quote) {
    return null;
  }

  return (
    <section className="card" style={{
      backgroundColor: '#f0f0f0',
      borderLeft: '4px solid #d4af37',
      fontStyle: 'italic',
      padding: '1.5rem',
    }}>
      <blockquote style={{ margin: 0, textAlign: 'center' }}>
        <p>&ldquo;{quote.quote}&rdquo;</p>
        <footer style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
          — {quote.author}
        </footer>
      </blockquote>
    </section>
  );
}
