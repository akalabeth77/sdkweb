'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { EventItem } from '@/types';
import { useLanguage } from '@/components/language-context';
import { getSourceLabel, toDateLocale } from '@/lib/i18n';

type RepeatWeekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

type EventForm = {
  title: string;
  description?: string;
  category?: EventItem['category'];
  start: string;
  end?: string;
  location?: string;
  applyToSeries?: boolean;
};

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${y}-${m}-${d}T${h}:${min}`;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [externalEvents, setExternalEvents] = useState<EventItem[]>([]);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatUntil, setRepeatUntil] = useState('');
  const [repeatDays, setRepeatDays] = useState<RepeatWeekday[]>([]);
  const { locale, t } = useLanguage();
  const categoryOptions: Array<{ value: NonNullable<EventItem['category']>; label: string }> = [
    { value: 'course', label: t.admin.eventCategoryCourse },
    { value: 'dance-party', label: t.admin.eventCategoryDanceParty },
    { value: 'workshop', label: t.admin.eventCategoryWorkshop },
    { value: 'festival', label: t.admin.eventCategoryFestival },
    { value: 'concert', label: t.admin.eventCategoryConcert },
    { value: 'other', label: t.admin.eventCategoryOther },
  ];

  const weekdayOptions: Array<{ value: RepeatWeekday; label: string }> = [
    { value: 'mon', label: t.admin.weekdayMon },
    { value: 'tue', label: t.admin.weekdayTue },
    { value: 'wed', label: t.admin.weekdayWed },
    { value: 'thu', label: t.admin.weekdayThu },
    { value: 'fri', label: t.admin.weekdayFri },
    { value: 'sat', label: t.admin.weekdaySat },
    { value: 'sun', label: t.admin.weekdaySun },
  ];

  function toggleRepeatDay(day: RepeatWeekday, checked: boolean) {
    if (checked) {
      setRepeatDays((prev: RepeatWeekday[]) => (prev.includes(day) ? prev : [...prev, day]));
      return;
    }

    setRepeatDays((prev: RepeatWeekday[]) => prev.filter((item: RepeatWeekday) => item !== day));
  }

  const loadEvents = useCallback(async () => {
    const response = await fetch('/api/admin/events', { cache: 'no-store' });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: t.admin.eventLoadError }))) as { error?: string };
      setLoadError(payload.error ?? t.admin.eventLoadError);
      setEvents([]);
      setExternalEvents([]);
      return;
    }

    const payload = (await response.json()) as { internalEvents: EventItem[]; externalEvents: EventItem[] };
    setEvents(payload.internalEvents);
    setExternalEvents(payload.externalEvents);
    setLoadError('');
  }, [t.admin.eventLoadError]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const start = String(formData.get('start') || '');
    const end = String(formData.get('end') || '');

    if (repeatEnabled && !repeatUntil) {
      setMessage(t.admin.eventRepeatUntilRequired);
      return;
    }

    if (repeatEnabled && repeatDays.length === 0) {
      setMessage(t.admin.eventRepeatDaysRequired);
      return;
    }

    const response = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        start,
        end,
        location: formData.get('location'),
        repeat: repeatEnabled,
        repeatUntil: repeatEnabled ? repeatUntil : '',
        repeatWeekdays: repeatEnabled ? repeatDays : [],
      })
    });

    if (response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { createdCount?: number };
      if (typeof payload.createdCount === 'number' && payload.createdCount > 1) {
        setMessage(`${t.admin.eventCreated} (${payload.createdCount})`);
      } else {
        setMessage(t.admin.eventCreated);
      }
      event.currentTarget.reset();
      setRepeatEnabled(false);
      setRepeatUntil('');
      setRepeatDays([]);
      await loadEvents();
      return;
    }

    const payload = (await response.json().catch(() => ({ error: t.admin.eventCreateError }))) as { error?: string };
    setMessage(payload.error ?? t.admin.eventCreateError);
  }

  async function updateEvent(id: string, data: EventForm) {
    const response = await fetch(`/api/admin/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { updatedCount?: number };
      if (typeof payload.updatedCount === 'number' && payload.updatedCount > 1) {
        setMessage(`${t.admin.eventUpdated} (${payload.updatedCount})`);
      } else {
        setMessage(t.admin.eventUpdated);
      }
      await loadEvents();
      return;
    }

    const payload = (await response.json().catch(() => ({ error: t.admin.eventUpdateError }))) as { error?: string };
    setMessage(payload.error ?? t.admin.eventUpdateError);
  }

  async function deleteEvent(id: string, deleteSeries?: boolean) {
    const confirmText = deleteSeries ? t.admin.confirmDeleteEventSeries : t.admin.confirmDeleteEvent;
    if (!window.confirm(confirmText)) {
      return;
    }

    const suffix = deleteSeries ? '?scope=series' : '';
    const response = await fetch(`/api/admin/events/${id}${suffix}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { deletedCount?: number };
      if (typeof payload.deletedCount === 'number' && payload.deletedCount > 1) {
        setMessage(`${t.admin.eventSeriesDeleted} (${payload.deletedCount})`);
      } else {
        setMessage(t.admin.eventDeleted);
      }
      await loadEvents();
      return;
    }

    setMessage(t.admin.eventDeleteError);
  }

  return (
    <section className="card">
      <h1>{t.admin.eventsTitle}</h1>
      <form onSubmit={createEvent}>
        <label>{t.admin.eventTitle}<input name="title" required /></label>
        <label>{t.admin.eventDescription}<textarea name="description" rows={4} /></label>
        <label>{t.admin.eventCategory}
          <select name="category" defaultValue="other">
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>{t.admin.eventStart}<input name="start" type="datetime-local" required /></label>
        <label>{t.admin.eventEnd}<input name="end" type="datetime-local" /></label>
        <label>{t.admin.eventLocation}<input name="location" /></label>
        <label>
          <input
            type="checkbox"
            checked={repeatEnabled}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setRepeatEnabled(event.target.checked)}
          />
          {' '}
          {t.admin.eventRecurring}
        </label>
        {repeatEnabled ? (
          <>
            <label>{t.admin.eventRepeatUntil}<input type="date" value={repeatUntil} onChange={(event: ChangeEvent<HTMLInputElement>) => setRepeatUntil(event.target.value)} required /></label>
            <fieldset>
              <legend>{t.admin.eventRepeatDays}</legend>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.5rem' }}>
                {weekdayOptions.map((weekday) => (
                  <label key={weekday.value} style={{ margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={repeatDays.includes(weekday.value)}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => toggleRepeatDay(weekday.value, event.target.checked)}
                    />
                    {' '}
                    {weekday.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        ) : null}
        <button type="submit">{t.admin.createEvent}</button>
      </form>

      {message ? <p className="small">{message}</p> : null}
      {loadError ? <p className="small">{loadError}</p> : null}

      <h2 style={{ marginTop: '1.5rem' }}>{t.admin.existingEvents}</h2>
      {events.length === 0 ? (
        <p className="small">{t.admin.noEventsFound}</p>
      ) : (
        <div className="grid" style={{ gap: '1rem' }}>
          {events.map((eventItem) => (
            <EditableEventCard
              key={eventItem.id}
              item={eventItem}
              onSave={updateEvent}
              onDelete={deleteEvent}
            />
          ))}
        </div>
      )}

      <h2 style={{ marginTop: '1.5rem' }}>{t.admin.externalEvents}</h2>
      <p className="small">{t.admin.externalEventsDescription}</p>
      {externalEvents.length === 0 ? (
        <p className="small">{t.admin.noExternalEventsFound}</p>
      ) : (
        <div className="grid" style={{ gap: '1rem' }}>
          {externalEvents.map((eventItem) => (
            <article key={eventItem.id} className="card">
              <strong>{eventItem.title}</strong>
              <div className="small">{getSourceLabel(locale, eventItem.source)} · {new Date(eventItem.start).toLocaleString(toDateLocale(locale))}</div>
              {eventItem.location ? <div className="small">{eventItem.location}</div> : null}
              {eventItem.description ? <p>{eventItem.description}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function EditableEventCard({
  item,
  onSave,
  onDelete,
}: {
  item: EventItem;
  onSave: (id: string, data: EventForm) => Promise<void>;
  onDelete: (id: string, deleteSeries?: boolean) => Promise<void>;
}) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? '');
  const [category, setCategory] = useState<NonNullable<EventItem['category']>>(item.category ?? 'other');
  const [start, setStart] = useState(toDatetimeLocal(item.start));
  const [end, setEnd] = useState(item.end ? toDatetimeLocal(item.end) : '');
  const [location, setLocation] = useState(item.location ?? '');
  const [applyToSeries, setApplyToSeries] = useState(false);
  const { locale, t } = useLanguage();
  const categoryOptions: Array<{ value: NonNullable<EventItem['category']>; label: string }> = [
    { value: 'course', label: t.admin.eventCategoryCourse },
    { value: 'dance-party', label: t.admin.eventCategoryDanceParty },
    { value: 'workshop', label: t.admin.eventCategoryWorkshop },
    { value: 'festival', label: t.admin.eventCategoryFestival },
    { value: 'concert', label: t.admin.eventCategoryConcert },
    { value: 'other', label: t.admin.eventCategoryOther },
  ];

  return (
    <form
      className="card"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSave(item.id, {
          title,
          description: description || undefined,
          category,
          start: new Date(start).toISOString(),
          end: end ? new Date(end).toISOString() : undefined,
          location: location || undefined,
          applyToSeries,
        });
      }}
    >
      <div className="small">{getSourceLabel(locale, item.source)} · {new Date(item.start).toLocaleString(toDateLocale(locale))}</div>
      <label>{t.admin.eventTitle}
        <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>{t.admin.eventDescription}
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
      </label>
      <label>{t.admin.eventCategory}
        <select value={category} onChange={(event) => setCategory(event.target.value as NonNullable<EventItem['category']>)}>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label>{t.admin.eventStart}
        <input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} required />
      </label>
      <label>{t.admin.eventEnd}
        <input type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
      </label>
      <label>{t.admin.eventLocation}
        <input value={location} onChange={(event) => setLocation(event.target.value)} />
      </label>
      {item.recurrenceGroupId ? (
        <label>
          <input
            type="checkbox"
            checked={applyToSeries}
            onChange={(event) => setApplyToSeries(event.target.checked)}
          />
          {' '}
          {t.admin.applyToEventSeries}
        </label>
      ) : null}
      <button type="submit">{t.common.save}</button>
      <button type="button" onClick={() => void onDelete(item.id)}>{t.common.delete}</button>
      {item.recurrenceGroupId ? (
        <button type="button" onClick={() => void onDelete(item.id, true)}>{t.admin.deleteEventSeries}</button>
      ) : null}
    </form>
  );
}
