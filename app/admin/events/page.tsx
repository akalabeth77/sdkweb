'use client';

import { FormEvent, useEffect, useState } from 'react';
import { EventItem } from '@/types';

type EventForm = {
  title: string;
  start: string;
  end?: string;
  location?: string;
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
  const [message, setMessage] = useState('');

  async function loadEvents() {
    const response = await fetch('/api/admin/events', { cache: 'no-store' });
    if (!response.ok) return;
    const payload = (await response.json()) as EventItem[];
    setEvents(payload);
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const start = String(formData.get('start') || '');
    const end = String(formData.get('end') || '');

    const response = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.get('title'),
        start: start ? new Date(start).toISOString() : '',
        end: end ? new Date(end).toISOString() : '',
        location: formData.get('location')
      })
    });

    if (response.ok) {
      setMessage('Event bol vytvorený.');
      event.currentTarget.reset();
      await loadEvents();
      return;
    }

    setMessage('Nepodarilo sa vytvoriť event.');
  }

  async function updateEvent(id: string, data: EventForm) {
    const response = await fetch(`/api/admin/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      setMessage('Event bol upravený.');
      await loadEvents();
      return;
    }

    setMessage('Nepodarilo sa upraviť event.');
  }

  async function deleteEvent(id: string) {
    if (!window.confirm('Naozaj chcete vymazať tento event?')) {
      return;
    }

    const response = await fetch(`/api/admin/events/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      setMessage('Event bol vymazaný.');
      await loadEvents();
      return;
    }

    setMessage('Nepodarilo sa vymazať event.');
  }

  return (
    <section className="card">
      <h1>Editor eventov</h1>
      <form onSubmit={createEvent}>
        <label>Názov eventu<input name="title" required /></label>
        <label>Začiatok<input name="start" type="datetime-local" required /></label>
        <label>Koniec<input name="end" type="datetime-local" /></label>
        <label>Lokalita<input name="location" /></label>
        <button type="submit">Pridať event</button>
      </form>

      {message ? <p className="small">{message}</p> : null}

      <h2 style={{ marginTop: '1.5rem' }}>Existujúce eventy</h2>
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
  onDelete: (id: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(item.title);
  const [start, setStart] = useState(toDatetimeLocal(item.start));
  const [end, setEnd] = useState(item.end ? toDatetimeLocal(item.end) : '');
  const [location, setLocation] = useState(item.location ?? '');

  return (
    <form
      className="card"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSave(item.id, {
          title,
          start: new Date(start).toISOString(),
          end: end ? new Date(end).toISOString() : undefined,
          location: location || undefined,
        });
      }}
    >
      <div className="small">{item.source}</div>
      <label>Názov
        <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>Začiatok
        <input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} required />
      </label>
      <label>Koniec
        <input type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
      </label>
      <label>Lokalita
        <input value={location} onChange={(event) => setLocation(event.target.value)} />
      </label>
      <button type="submit">Uložiť zmeny</button>
      <button type="button" onClick={() => void onDelete(item.id)}>Vymazať</button>
    </form>
  );
}
