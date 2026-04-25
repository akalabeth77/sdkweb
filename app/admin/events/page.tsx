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
  isInternal?: boolean;
  applyToSeries?: boolean;
};

type AdminRegistrationItem = {
  id: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  event: {
    id: string;
    title: string;
    start: string;
    location?: string;
  };
};

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function EventRegistrationsList() {
  const [registrations, setRegistrations] = useState<AdminRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    try {
      const response = await fetch('/api/admin/registrations', { cache: 'no-store' });
      if (!response.ok) {
        setRegistrations([]);
        return;
      }

      const payload = (await response.json()) as { data: AdminRegistrationItem[] };
      setRegistrations(payload.data);
    } catch {
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="small">Nacitavam registracie...</p>;
  }

  if (registrations.length === 0) {
    return <p className="small">Zatial neexistuju ziadne registracie na eventy.</p>;
  }

  return (
    <div className="grid" style={{ gap: '0.75rem' }}>
      {registrations.map((registration) => (
        <article key={registration.id} className="card">
          <div className="event-meta-row">
            <div>
              <strong>{registration.event.title}</strong>
              <div className="small">{registration.user.name} · {registration.user.email}</div>
              <div className="small">{new Date(registration.event.start).toLocaleString('sk-SK')}</div>
              {registration.event.location ? <div className="small">{registration.event.location}</div> : null}
            </div>
            <span className="event-badge" style={{ backgroundColor: registration.status === 'cancelled' ? '#b91c1c' : '#166534' }}>
              {registration.status}
            </span>
          </div>
        </article>
      ))}
    </div>
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
  const [isInternal, setIsInternal] = useState(item.source === 'internal');
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
          isInternal,
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
      <label>
        <input type="checkbox" checked={isInternal} onChange={(event) => setIsInternal(event.target.checked)} />
        {' '}
        {t.admin.internalEvent}
      </label>
      {item.recurrenceGroupId ? (
        <label>
          <input type="checkbox" checked={applyToSeries} onChange={(event) => setApplyToSeries(event.target.checked)} />
          {' '}
          {t.admin.applyToEventSeries}
        </label>
      ) : null}
      <div className="event-actions-row">
        <button type="submit" style={{ width: 'auto' }}>{t.common.save}</button>
        <button type="button" onClick={() => void onDelete(item.id)} style={{ width: 'auto', background: '#b91c1c' }}>{t.common.delete}</button>
        {item.recurrenceGroupId ? (
          <button type="button" onClick={() => void onDelete(item.id, true)} style={{ width: 'auto', background: '#92400e' }}>{t.admin.deleteEventSeries}</button>
        ) : null}
      </div>
    </form>
  );
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [externalEvents, setExternalEvents] = useState<EventItem[]>([]);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [newEventInternal, setNewEventInternal] = useState(true);
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

  function toggleRepeatDay(day: RepeatWeekday, checked: boolean) {
    if (checked) {
      setRepeatDays((prev) => (prev.includes(day) ? prev : [...prev, day]));
      return;
    }

    setRepeatDays((prev) => prev.filter((item) => item !== day));
  }

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

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
        start: formData.get('start'),
        end: formData.get('end'),
        location: formData.get('location'),
        isInternal: newEventInternal,
        repeat: repeatEnabled,
        repeatUntil: repeatEnabled ? repeatUntil : '',
        repeatWeekdays: repeatEnabled ? repeatDays : [],
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string; createdCount?: number };
    if (!response.ok) {
      setMessage(payload.error ?? t.admin.eventCreateError);
      return;
    }

    setMessage(typeof payload.createdCount === 'number' && payload.createdCount > 1
      ? `${t.admin.eventCreated} (${payload.createdCount})`
      : t.admin.eventCreated);
    event.currentTarget.reset();
    setRepeatEnabled(false);
    setNewEventInternal(true);
    setRepeatUntil('');
    setRepeatDays([]);
    await loadEvents();
  }

  async function updateEvent(id: string, data: EventForm) {
    const response = await fetch(`/api/admin/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string; updatedCount?: number };
    if (!response.ok) {
      setMessage(payload.error ?? t.admin.eventUpdateError);
      return;
    }

    setMessage(typeof payload.updatedCount === 'number' && payload.updatedCount > 1
      ? `${t.admin.eventUpdated} (${payload.updatedCount})`
      : t.admin.eventUpdated);
    await loadEvents();
  }

  async function deleteEvent(id: string, deleteSeries?: boolean) {
    const confirmText = deleteSeries ? t.admin.confirmDeleteEventSeries : t.admin.confirmDeleteEvent;
    if (!window.confirm(confirmText)) {
      return;
    }

    const suffix = deleteSeries ? '?scope=series' : '';
    const response = await fetch(`/api/admin/events/${id}${suffix}`, { method: 'DELETE' });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; deletedCount?: number };

    if (!response.ok) {
      setMessage(payload.error ?? t.admin.eventDeleteError);
      return;
    }

    setMessage(typeof payload.deletedCount === 'number' && payload.deletedCount > 1
      ? `${t.admin.eventSeriesDeleted} (${payload.deletedCount})`
      : t.admin.eventDeleted);
    await loadEvents();
  }

  return (
    <section className="card">
      <h1>{t.admin.eventsTitle}</h1>
      <form onSubmit={(event) => void createEvent(event)}>
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
          <input type="checkbox" checked={newEventInternal} onChange={(event: ChangeEvent<HTMLInputElement>) => setNewEventInternal(event.target.checked)} />
          {' '}
          {t.admin.internalEvent}
        </label>
        <label>
          <input type="checkbox" checked={repeatEnabled} onChange={(event: ChangeEvent<HTMLInputElement>) => setRepeatEnabled(event.target.checked)} />
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
            <EditableEventCard key={eventItem.id} item={eventItem} onSave={updateEvent} onDelete={deleteEvent} />
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

      <h2 style={{ marginTop: '1.5rem' }}>Registracie na eventy</h2>
      <EventRegistrationsList />
    </section>
  );
}
