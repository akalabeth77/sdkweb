'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EventItem, EventCategory } from '@/types';
import { EventMiniCalendar } from '@/components/event-mini-calendar';
import { ShareButtons } from '@/components/share-buttons';
import { Locale, getEventCategoryColor, getEventCategoryLabel, getSourceLabel, toDateLocale } from '@/lib/i18n';

type Props = {
  events: EventItem[];
  locale: Locale;
  labels: {
    title: string;
    description: string;
    currentMonth: string;
    noEventsThisMonth: string;
    shareEvent: string;
    filterLabel: string;
    filterAll: string;
    selectedDay: string;
    clearDayFilter: string;
    readMore: string;
    copyLink: string;
    copied: string;
  };
  categoryLabels: Array<{ value: EventCategory; label: string }>;
};

export function EventsExplorer({ events, locale, labels, categoryLabels }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | EventCategory>('all');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (selectedCategory !== 'all' && (event.category ?? 'other') !== selectedCategory) {
        return false;
      }

      if (selectedDay !== null) {
        const eventDate = new Date(event.start);
        const now = new Date();
        if (eventDate.getFullYear() !== now.getFullYear() || eventDate.getMonth() !== now.getMonth() || eventDate.getDate() !== selectedDay) {
          return false;
        }
      }

      return true;
    });
  }, [events, selectedCategory, selectedDay]);

  return (
    <div className="grid grid-2" style={{ alignItems: 'start' }}>
      <section className="card">
        <h1>{labels.title}</h1>
        <p>{labels.description}</p>
        <div className="event-filter-row">
          <span className="small">{labels.filterLabel}</span>
          <div className="event-filter-chips">
            <button
              type="button"
              className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              {labels.filterAll}
            </button>
            {categoryLabels.map((category) => (
              <button
                key={category.value}
                type="button"
                className={`filter-chip ${selectedCategory === category.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.value)}
                style={{ borderColor: getEventCategoryColor(category.value) }}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        {selectedDay !== null ? (
          <div className="event-day-filter">
            <strong>{labels.selectedDay}: {selectedDay}.</strong>
            <button type="button" className="share-btn" onClick={() => setSelectedDay(null)}>{labels.clearDayFilter}</button>
          </div>
        ) : null}
        {filteredEvents.map((event) => (
          <article key={event.id} id={event.id} className="event-card-public">
            <div className="event-meta-row">
              <strong>{event.title}</strong>
              <span className="event-badge" style={{ backgroundColor: getEventCategoryColor(event.category) }}>
                {getEventCategoryLabel(locale, event.category)}
              </span>
            </div>
            <div className="small">
              {new Date(event.start).toLocaleString(toDateLocale(locale))}
              {event.location ? ` · ${event.location}` : ''} · {getSourceLabel(locale, event.source)}
            </div>
            {event.description ? <p>{event.description}</p> : null}
            <div className="event-actions-row">
              <Link href={`/events/${encodeURIComponent(event.id)}`} className="share-link share-btn">{labels.readMore}</Link>
            </div>
            <ShareButtons
              title={event.title}
              text={event.description}
              path={`/events/${encodeURIComponent(event.id)}`}
              anchorId={event.id}
              label={labels.shareEvent}
              copyLabel={labels.copyLink}
              copiedLabel={labels.copied}
            />
          </article>
        ))}
      </section>
      <EventMiniCalendar
        events={events}
        locale={locale}
        monthLabel={labels.currentMonth}
        emptyLabel={labels.noEventsThisMonth}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />
    </div>
  );
}