'use client';

import { EventItem } from '@/types';
import { Locale, getEventCategoryColor, getEventCategoryLabel } from '@/lib/i18n';

type Props = {
  events: EventItem[];
  locale: Locale;
  monthLabel: string;
  emptyLabel: string;
  selectedDay?: number | null;
  onSelectDay?: (day: number | null) => void;
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function EventMiniCalendar({ events, locale, monthLabel, emptyLabel, selectedDay, onSelectDay }: Props) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const firstWeekday = (monthStart.getDay() + 6) % 7;
  const totalDays = monthEnd.getDate();
  const cells = Array.from({ length: firstWeekday + totalDays }, (_, index) => {
    if (index < firstWeekday) {
      return null;
    }

    return index - firstWeekday + 1;
  });

  const monthEvents = events.filter((event) => {
    const eventDate = new Date(event.start);
    return eventDate >= monthStart && eventDate <= monthEnd;
  });

  const eventsByDay = new Map<number, EventItem[]>();
  for (const event of monthEvents) {
    const day = new Date(event.start).getDate();
    const existing = eventsByDay.get(day) ?? [];
    existing.push(event);
    eventsByDay.set(day, existing);
  }

  const weekdayLabels = locale === 'sk'
    ? ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const legendCategories: Array<NonNullable<EventItem['category']>> = ['course', 'dance-party', 'workshop', 'festival', 'concert', 'other'];

  return (
    <section className="calendar-card card">
      <div className="calendar-header">
        <h2>{monthLabel}</h2>
        <div className="small">{now.toLocaleDateString(locale === 'sk' ? 'sk-SK' : 'en-US', { month: 'long', year: 'numeric' })}</div>
      </div>
      <div className="calendar-grid calendar-weekdays">
        {weekdayLabels.map((label) => (
          <div key={label} className="calendar-weekday">{label}</div>
        ))}
      </div>
      <div className="calendar-grid calendar-days">
        {cells.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="calendar-day calendar-day-empty" />;
          }

          const dayEvents = eventsByDay.get(day) ?? [];

          return (
            <button
              key={day}
              type="button"
              className={`calendar-day ${selectedDay === day ? 'calendar-day-selected' : ''}`}
              onClick={() => onSelectDay?.(selectedDay === day ? null : day)}
            >
              <div className="calendar-day-number">{day}</div>
              <div className="calendar-dots">
                {dayEvents.slice(0, 4).map((event) => (
                  <span
                    key={event.id}
                    className="calendar-dot"
                    style={{ backgroundColor: getEventCategoryColor(event.category) }}
                    title={event.title}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
      <div className="calendar-legend">
        {legendCategories.map((category) => (
          <div key={category} className="calendar-legend-item">
            <span className="calendar-dot" style={{ backgroundColor: getEventCategoryColor(category) }} />
            <span>{getEventCategoryLabel(locale, category)}</span>
          </div>
        ))}
      </div>
      {monthEvents.length === 0 ? <p className="small">{emptyLabel}</p> : null}
    </section>
  );
}
