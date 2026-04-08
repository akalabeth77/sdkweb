'use client';

import { EventItem } from '@/types';
import { Locale, getEventCategoryColor, getEventCategoryLabel } from '@/lib/i18n';

type Props = {
  events: EventItem[];
  locale: Locale;
  monthLabel: string;
  calendarTitle: string;
  previousMonthLabel: string;
  nextMonthLabel: string;
  monthPickerLabel: string;
  yearPickerLabel: string;
  emptyLabel: string;
  selectedDate?: string | null;
  onSelectDate?: (date: string | null) => void;
  visibleMonth: Date;
  onVisibleMonthChange: (month: Date) => void;
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function EventMiniCalendar({ events, locale, monthLabel, emptyLabel, selectedDay, onSelectDay }: Props) {
function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function EventMiniCalendar({
  events,
  locale,
  monthLabel,
  calendarTitle,
  previousMonthLabel,
  nextMonthLabel,
  monthPickerLabel,
  yearPickerLabel,
  emptyLabel,
  selectedDate,
  onSelectDate,
  visibleMonth,
  onVisibleMonthChange,
}: Props) {
  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
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

  const yearCandidates = new Set<number>([visibleMonth.getFullYear() - 1, visibleMonth.getFullYear(), visibleMonth.getFullYear() + 1]);
  for (const event of events) {
    yearCandidates.add(new Date(event.start).getFullYear());
  }
  const yearOptions = Array.from(yearCandidates).sort((a, b) => a - b);
  const monthOptions = Array.from({ length: 12 }, (_, month) => ({
    value: month,
    label: new Date(2000, month, 1).toLocaleDateString(locale === 'sk' ? 'sk-SK' : 'en-US', { month: 'long' }),
  }));

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
        <h2>{calendarTitle}</h2>
        <div className="small">{visibleMonth.toLocaleDateString(locale === 'sk' ? 'sk-SK' : 'en-US', { month: 'long', year: 'numeric' })}</div>
      </div>
      <div className="calendar-controls">
        <button
          type="button"
          className="filter-chip"
          onClick={() => onVisibleMonthChange(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
        >
          {previousMonthLabel}
        </button>
        <button
          type="button"
          className="filter-chip"
          onClick={() => onVisibleMonthChange(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
        >
          {nextMonthLabel}
        </button>
      </div>
      <div className="calendar-controls calendar-select-row">
        <label className="small">
          {monthPickerLabel}
          <select
            value={visibleMonth.getMonth()}
            onChange={(event) => onVisibleMonthChange(new Date(visibleMonth.getFullYear(), Number(event.target.value), 1))}
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </label>
        <label className="small">
          {yearPickerLabel}
          <select
            value={visibleMonth.getFullYear()}
            onChange={(event) => onVisibleMonthChange(new Date(Number(event.target.value), visibleMonth.getMonth(), 1))}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
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
          const dateKey = toDateKey(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));

          return (
            <button
              key={day}
              type="button"
              className={`calendar-day ${selectedDate === dateKey ? 'calendar-day-selected' : ''}`}
              onClick={() => onSelectDate?.(selectedDate === dateKey ? null : dateKey)}
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
        <span className="small" style={{ width: '100%' }}>{monthLabel}</span>
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
