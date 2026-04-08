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
    calendarTitle: string;
    previousMonth: string;
    nextMonth: string;
    month: string;
    year: string;
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  function toDateKey(value: string): string {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (selectedCategory !== 'all' && (event.category ?? 'other') !== selectedCategory) {
        return false;
      }

      if (selectedDate !== null && toDateKey(event.start) !== selectedDate) {
        return false;
      }

      return true;
    });
  }, [events, selectedCategory, selectedDate]);

  const selectedDateLabel = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString(toDateLocale(locale), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : null;

  return (
    <div className="grid grid-2" style={{ alignItems: 'start' }}>
      <EventMiniCalendar
        events={events}
        locale={locale}
        monthLabel={labels.currentMonth}
        calendarTitle={labels.calendarTitle}
        previousMonthLabel={labels.previousMonth}
        nextMonthLabel={labels.nextMonth}
        monthPickerLabel={labels.month}
        yearPickerLabel={labels.year}
        emptyLabel={labels.noEventsThisMonth}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        visibleMonth={visibleMonth}
        onVisibleMonthChange={(nextMonth) => {
          setVisibleMonth(nextMonth);
          setSelectedDate(null);
        }}
      />
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
        {selectedDateLabel !== null ? (
          <div className="event-day-filter">
            <strong>{labels.selectedDay}: {selectedDateLabel}</strong>
            <button type="button" className="share-btn" onClick={() => setSelectedDate(null)}>{labels.clearDayFilter}</button>
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
    </div>
  );
}