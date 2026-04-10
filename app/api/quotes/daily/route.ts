import { NextResponse } from 'next/server';

const SWING_DANCE_QUOTES = [
  {
    text: "Swing dancing is not just a dance, it's a way of life.",
    author: "Swing Dance Community"
  },
  {
    text: "Every kick, every turn, every spin – that's where the joy lives.",
    author: "Swing Dancer"
  },
  {
    text: "The magic happens when the music guides your feet and your partner trusts your lead.",
    author: "Lindy Hop Enthusiast"
  },
  {
    text: "In swing, we're not just dancing – we're telling a story with our bodies and souls.",
    author: "Choreographer"
  },
  {
    text: "Swing dance is the art of improvisation wrapped in rhythm and joy.",
    author: "Dance Instructor"
  },
  {
    text: "The swing community is built on connection, respect, and pure joy of movement.",
    author: "Community Leader"
  },
  {
    text: "Good followers lead dancers to be better leaders, and good leaders make followers shine.",
    author: "Dance Wisdom"
  },
  {
    text: "Swing is where music, movement, and friendship blend into something magical.",
    author: "Swing Dancer"
  },
  {
    text: "There's nothing quite like the feeling of a perfect swing out with the right partner.",
    author: "Lindy Hop Lover"
  },
  {
    text: "Dance like nobody's watching, lead like you know where you're going, follow like you trust completely.",
    author: "Swing Philosophy"
  },
  {
    text: "Swing dancing teaches you that connection is everything.",
    author: "Dance Coach"
  },
  {
    text: "The best dancers on the floor aren't always the ones with the most tricks – they're the ones who feel the music.",
    author: "Experienced Dancer"
  },
  {
    text: "In every swing dance, there are eight beats of infinite possibilities.",
    author: "Rhythm Master"
  },
  {
    text: "Swing is a conversation between partners, written to the beat of jazz.",
    author: "Jazz Enthusiast"
  },
  {
    text: "When you swing, you're not just moving – you're connecting with decades of dance history.",
    author: "Dance Historian"
  },
];

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get today's date to ensure same quote for entire day
    const today = new Date();
    const dateKey = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Use date hash to select a quote consistently for the day
    let hash = 0;
    for (let i = 0; i < dateKey.length; i++) {
      const char = dateKey.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const quoteIndex = Math.abs(hash) % SWING_DANCE_QUOTES.length;
    const quote = SWING_DANCE_QUOTES[quoteIndex];

    return NextResponse.json({
      quote: quote.text,
      author: quote.author,
      date: dateKey,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Failed to fetch daily quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
