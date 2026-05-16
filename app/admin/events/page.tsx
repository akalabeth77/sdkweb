'use client';

import { useCallback, useEffect, useState } from 'react';
import { EventItem } from '@/types';
import { useLanguage } from '@/components/language-context';
import { toDateLocale } from '@/lib/i18n';

type RepeatWeekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type EventForm = {
  title: string; description: string; category: NonNullable<EventItem['category']>;
  start: string; end: string; location: string; registrationUrl: string;
  hasRegistrationForm: boolean; isInternal: boolean; applyToSeries: boolean;
};

const EMPTY_FORM: EventForm = {
  title: '', description: '', category: 'other', start: '', end: '',
  location: '', registrationUrl: '', hasRegistrationForm: false, isInternal: true, applyToSeries: false,
};

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso.replace(/Z$/, '')); // preserve stored local time
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

const CAT_COLOR: Record<string, string> = {
  course:'#2563eb','dance-party':'#db2777',workshop:'#7c3aed',festival:'#ea580c',concert:'#059669',other:'#6b7280',
};

function Overlay({ onBg, children }: { onBg:()=>void; children: React.ReactNode }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}
      onClick={e=>{if(e.target===e.currentTarget)onBg();}}>
      <div style={{background:'#fff',borderRadius:'14px',padding:'1.5rem',width:'100%',maxWidth:'560px',maxHeight:'90vh',overflowY:'auto'}}>
        {children}
      </div>
    </div>
  );
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [externalEvents, setExternalEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [editEvent, setEditEvent] = useState<EventItem|null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatUntil, setRepeatUntil] = useState('');
  const [repeatDays, setRepeatDays] = useState<RepeatWeekday[]>([]);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [extendUntil, setExtendUntil] = useState('');
  const [extendDays, setExtendDays] = useState<RepeatWeekday[]>([]);
  const [extending, setExtending] = useState(false);
  const { locale, t } = useLanguage();

  const CAT_OPTS = [
    {value:'course',label:t.admin.eventCategoryCourse},{value:'dance-party',label:t.admin.eventCategoryDanceParty},
    {value:'workshop',label:t.admin.eventCategoryWorkshop},{value:'festival',label:t.admin.eventCategoryFestival},
    {value:'concert',label:t.admin.eventCategoryConcert},{value:'other',label:t.admin.eventCategoryOther},
  ];
  const WEEK_OPTS = [
    {value:'mon',label:t.admin.weekdayMon},{value:'tue',label:t.admin.weekdayTue},
    {value:'wed',label:t.admin.weekdayWed},{value:'thu',label:t.admin.weekdayThu},
    {value:'fri',label:t.admin.weekdayFri},{value:'sat',label:t.admin.weekdaySat},
    {value:'sun',label:t.admin.weekdaySun},
  ];

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/events', { cache: 'no-store' });
    if (res.ok) {
      const p = await res.json() as {internalEvents:EventItem[];externalEvents:EventItem[]};
      setEvents(p.internalEvents); setExternalEvents(p.externalEvents);
    }
    setLoading(false);
  }, []);
  useEffect(()=>{void load();},[load]);

  const allEvents = [...events, ...externalEvents].sort((a,b)=>a.start.localeCompare(b.start));
  const filtered = allEvents.filter(e => {
    const q = search.toLowerCase();
    return (!q || e.title.toLowerCase().includes(q) || (e.location??'').toLowerCase().includes(q))
      && (catFilter==='all' || (e.category??'other')===catFilter);
  });

  // Group series for list display
  const groups = new Map<string, EventItem[]>();
  const singles: EventItem[] = [];
  for (const e of filtered) {
    if (e.recurrenceGroupId) {
      const arr = groups.get(e.recurrenceGroupId) ?? [];
      arr.push(e); groups.set(e.recurrenceGroupId, arr);
    } else singles.push(e);
  }

  function openEdit(e: EventItem) {
    setEditEvent(e);
    setForm({
      title:e.title, description:e.description??'', category:e.category??'other',
      start:toDatetimeLocal(e.start), end:e.end?toDatetimeLocal(e.end):'',
      location:e.location??'', registrationUrl:e.registrationUrl??'',
      hasRegistrationForm:(e as any).hasRegistrationForm??false,
      isInternal:e.source==='internal', applyToSeries:false,
    });
    setExtendUntil('');
    if (e.recurrenceGroupId) {
      const dayMap: RepeatWeekday[] = ['sun','mon','tue','wed','thu','fri','sat'];
      const detected = new Set(
        allEvents.filter(ev => ev.recurrenceGroupId === e.recurrenceGroupId)
          .map(ev => dayMap[new Date(ev.start.replace(/Z$/,'')).getDay()])
      );
      setExtendDays(Array.from(detected));
    } else {
      setExtendDays([]);
    }
  }

  function closeModal() { setEditEvent(null); setCreateOpen(false); setExtendUntil(''); }

  async function extendSeries() {
    if (!editEvent || !extendUntil || extendDays.length === 0) {
      setMsg('Vyber dni a dátum predĺženia.'); return;
    }
    setExtending(true);
    const res = await fetch(`/api/admin/events/${editEvent.id}`, {
      method: 'PATCH', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ extendUntil, weekdays: extendDays }),
    });
    const p = await res.json().catch(()=>({})) as { createdCount?: number; error?: string };
    if (res.ok) {
      setMsg(`Séria predĺžená o ${p.createdCount ?? 0} eventov.`);
      closeModal(); await load();
    } else {
      setMsg(`❌ ${p.error ?? 'Chyba'}`);
    }
    setExtending(false);
  }

  async function saveEvent() {
    if (!form.title.trim() || !form.start) return;
    setSaving(true);
    if (createOpen) {
      if (repeatEnabled && (!repeatUntil || repeatDays.length===0)) {
        setMsg('Vyplň dni a dátum opakovania.'); setSaving(false); return;
      }
      const res = await fetch('/api/admin/events', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          title:form.title, description:form.description||undefined, category:form.category,
          start:form.start, end:form.end||undefined, location:form.location||undefined,
          registrationUrl:form.registrationUrl||undefined, hasRegistrationForm:form.hasRegistrationForm,
          isInternal:form.isInternal, repeat:repeatEnabled, repeatUntil:repeatEnabled?repeatUntil:'',
          repeatWeekdays:repeatEnabled?repeatDays:[],
        }),
      });
      const p = await res.json().catch(()=>({})) as {createdCount?:number};
      if (res.ok) {
        setMsg(p.createdCount&&p.createdCount>1 ? `${t.admin.eventCreated} (${p.createdCount})` : t.admin.eventCreated);
        closeModal(); setRepeatEnabled(false); setRepeatDays([]); setRepeatUntil('');
        await load();
      } else setMsg(t.admin.eventCreateError);
    } else if (editEvent) {
      const res = await fetch(`/api/admin/events/${editEvent.id}`, {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          title:form.title, description:form.description||undefined, category:form.category,
          start:new Date(form.start).toISOString(), end:form.end?new Date(form.end).toISOString():undefined,
          location:form.location||undefined, registrationUrl:form.registrationUrl||undefined,
          hasRegistrationForm:form.hasRegistrationForm, isInternal:form.isInternal, applyToSeries:form.applyToSeries,
        }),
      });
      const p = await res.json().catch(()=>({})) as {updatedCount?:number};
      if (res.ok) {
        setMsg(p.updatedCount&&p.updatedCount>1 ? `${t.admin.eventUpdated} (${p.updatedCount})` : t.admin.eventUpdated);
        closeModal(); await load();
      } else setMsg(t.admin.eventUpdateError);
    }
    setSaving(false);
  }

  async function deleteEvent(id:string, series=false) {
    if (!confirm(series ? t.admin.confirmDeleteEventSeries : t.admin.confirmDeleteEvent)) return;
    const res = await fetch(`/api/admin/events/${id}${series?'?scope=series':''}`,{method:'DELETE'});
    const p = await res.json().catch(()=>({})) as {deletedCount?:number};
    if (res.ok) {
      setMsg(p.deletedCount&&p.deletedCount>1?`${t.admin.eventSeriesDeleted} (${p.deletedCount})`:t.admin.eventDeleted);
      closeModal(); await load();
    } else setMsg(t.admin.eventDeleteError);
  }

  const f = (v:keyof EventForm, val:unknown) => setForm(prev=>({...prev,[v]:val}));

  const EventFormFields = () => (
    <>
      <label>{t.admin.eventTitle}<input value={form.title} onChange={e=>f('title',e.target.value)} required /></label>
      <label>{t.admin.eventDescription}<textarea value={form.description} onChange={e=>f('description',e.target.value)} rows={3} style={{width:'100%'}} /></label>
      <label>{t.admin.eventCategory}
        <select value={form.category} onChange={e=>f('category',e.target.value)}>
          {CAT_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
        <label style={{flex:1}}>{t.admin.eventStart}<input type="datetime-local" value={form.start} onChange={e=>f('start',e.target.value)} required /></label>
        <label style={{flex:1}}>{t.admin.eventEnd}<input type="datetime-local" value={form.end} onChange={e=>f('end',e.target.value)} /></label>
      </div>
      <label>{t.admin.eventLocation}<input value={form.location} onChange={e=>f('location',e.target.value)} /></label>
      <label>Registračný odkaz<input type="url" value={form.registrationUrl} onChange={e=>f('registrationUrl',e.target.value)} placeholder="https://forms.gle/..." /></label>
      <label style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'0.5rem'}}>
        <input type="checkbox" checked={form.hasRegistrationForm} onChange={e=>f('hasRegistrationForm',e.target.checked)} /> Aktivovať registračný formulár
      </label>
      <label style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
        <input type="checkbox" checked={form.isInternal} onChange={e=>f('isInternal',e.target.checked)} /> {t.admin.internalEvent}
      </label>
    </>
  );

  return (
    <section className="card">
      <h1>{t.admin.eventsTitle}</h1>
      {msg && <p className="small">{msg}</p>}

      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <input placeholder="Hľadaj podľa názvu alebo miesta…" value={search} onChange={e=>setSearch(e.target.value)} style={{flex:'1 1 200px',margin:0}} />
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{margin:0}}>
          <option value="all">Všetky kategórie</option>
          {CAT_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button type="button" onClick={()=>{setForm(EMPTY_FORM);setRepeatEnabled(false);setRepeatDays([]);setRepeatUntil('');setCreateOpen(true);}}>+ Nový event</button>
      </div>

      {loading ? <p className="small">Načítavam…</p> : (
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'}}>
            <thead><tr style={{borderBottom:'2px solid #e8e8e8',textAlign:'left'}}>
              <th style={{padding:'8px 10px'}}>Názov</th>
              <th style={{padding:'8px 10px'}}>Kategória</th>
              <th style={{padding:'8px 10px'}}>Dátum</th>
              <th style={{padding:'8px 10px'}}>Miesto</th>
              <th style={{padding:'8px 10px'}}></th>
            </tr></thead>
            <tbody>
              {/* Singles */}
              {singles.map(e=>{
                const d = new Date(e.start.replace(/Z$/,''));
                const isPast = d < new Date();
                return (
                  <tr key={e.id} style={{borderBottom:'1px solid #f0f0f0',opacity:isPast?0.5:1}}>
                    <td style={{padding:'8px 10px',fontWeight:600}}>{e.title}</td>
                    <td style={{padding:'8px 10px'}}>
                      <span style={{background:CAT_COLOR[e.category??'other'],color:'#fff',padding:'2px 7px',borderRadius:'5px',fontSize:'0.75rem',fontWeight:700}}>
                        {CAT_OPTS.find(c=>c.value===e.category)?.label??'Iné'}
                      </span>
                    </td>
                    <td style={{padding:'8px 10px',fontSize:'0.85rem',whiteSpace:'nowrap'}}>
                      {d.toLocaleDateString(toDateLocale(locale))} {d.toLocaleTimeString(toDateLocale(locale),{hour:'2-digit',minute:'2-digit'})}
                    </td>
                    <td style={{padding:'8px 10px',fontSize:'0.85rem',color:'#666'}}>{e.location??'–'}</td>
                    <td style={{padding:'8px 10px'}}>
                      <button type="button" style={{fontSize:'0.8rem',padding:'4px 10px'}} onClick={()=>openEdit(e)}>✏️ Upraviť</button>
                    </td>
                  </tr>
                );
              })}
              {/* Series groups */}
              {Array.from(groups.entries()).map(([gid, gevents])=>{
                const first = gevents[0]; const last = gevents[gevents.length-1];
                const expanded = expandedGroups.has(gid);
                const shown = expanded ? gevents : gevents.slice(0,3);
                const hidden = gevents.length - 3;
                return (
                  <tr key={gid} style={{borderBottom:'1px solid #f0f0f0',background:'#fafafa'}}>
                    <td style={{padding:'8px 10px',fontWeight:600}}>
                      {first.title}
                      <span className="small" style={{fontWeight:400,color:'#888',marginLeft:'0.4rem'}}>({gevents.length}× séria)</span>
                    </td>
                    <td style={{padding:'8px 10px'}}>
                      <span style={{background:CAT_COLOR[first.category??'other'],color:'#fff',padding:'2px 7px',borderRadius:'5px',fontSize:'0.75rem',fontWeight:700}}>
                        {CAT_OPTS.find(c=>c.value===first.category)?.label??'Iné'}
                      </span>
                    </td>
                    <td style={{padding:'8px 10px',fontSize:'0.85rem',whiteSpace:'nowrap'}}>
                      {new Date(first.start.replace(/Z$/,'')).toLocaleDateString(toDateLocale(locale))} – {new Date(last.start.replace(/Z$/,'')).toLocaleDateString(toDateLocale(locale))}
                    </td>
                    <td style={{padding:'8px 10px',fontSize:'0.85rem',color:'#666'}}>{first.location??'–'}</td>
                    <td style={{padding:'8px 10px'}}>
                      <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                        {shown.map(e=>(
                          <button key={e.id} type="button" style={{fontSize:'0.75rem',padding:'3px 7px'}} onClick={()=>openEdit(e)}>
                            {new Date(e.start.replace(/Z$/,'')).toLocaleDateString(toDateLocale(locale),{day:'numeric',month:'short'})}
                          </button>
                        ))}
                        {!expanded && hidden > 0 && (
                          <button type="button" style={{fontSize:'0.75rem',padding:'3px 7px',background:'#e0e7ff',color:'#3730a3',border:'none',borderRadius:'5px',cursor:'pointer'}}
                            onClick={()=>setExpandedGroups(prev=>{const s=new Set(prev);s.add(gid);return s;})}>
                            +{hidden} ▾
                          </button>
                        )}
                        {expanded && (
                          <button type="button" style={{fontSize:'0.75rem',padding:'3px 7px',background:'#e0e7ff',color:'#3730a3',border:'none',borderRadius:'5px',cursor:'pointer'}}
                            onClick={()=>setExpandedGroups(prev=>{const s=new Set(prev);s.delete(gid);return s;})}>
                            ▴ menej
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      {createOpen && (
        <Overlay onBg={closeModal}>
          <h2 style={{margin:'0 0 1rem'}}>Nový event</h2>
          <EventFormFields />
          <hr style={{margin:'1rem 0',border:'none',borderTop:'1px solid #eee'}} />
          <label style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'0.75rem',fontWeight:700}}>
            <input type="checkbox" checked={repeatEnabled} onChange={e=>setRepeatEnabled(e.target.checked)} /> Opakovať event
          </label>
          {repeatEnabled && (
            <>
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.75rem'}}>
                {WEEK_OPTS.map(d=>(
                  <label key={d.value} style={{display:'flex',gap:'4px',alignItems:'center',padding:'4px 8px',background:repeatDays.includes(d.value as RepeatWeekday)?'#1a1a2e':'#f0f0f0',color:repeatDays.includes(d.value as RepeatWeekday)?'#fff':'#333',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem',fontWeight:600}}>
                    <input type="checkbox" checked={repeatDays.includes(d.value as RepeatWeekday)} onChange={e=>{setRepeatDays(prev=>e.target.checked?[...prev,d.value as RepeatWeekday]:prev.filter(x=>x!==d.value));}} style={{display:'none'}} /> {d.label}
                  </label>
                ))}
              </div>
              <label>Opakovať do<input type="date" value={repeatUntil} onChange={e=>setRepeatUntil(e.target.value)} /></label>
            </>
          )}
          <div style={{display:'flex',gap:'0.5rem',marginTop:'1rem'}}>
            <button type="button" onClick={saveEvent} disabled={saving}>{saving?'Ukladám…':'✅ Vytvoriť'}</button>
            <button type="button" style={{background:'#f0f0f0',color:'#333'}} onClick={closeModal}>Zatvoriť</button>
          </div>
        </Overlay>
      )}

      {/* Edit modal */}
      {editEvent && (
        <Overlay onBg={closeModal}>
          <h2 style={{margin:'0 0 1rem'}}>Upraviť: {editEvent.title}</h2>
          <EventFormFields />
          {editEvent.recurrenceGroupId && (
            <>
              <p className="small" style={{color:'#888',marginTop:'0.5rem'}}>Tento event je súčasť série.</p>
              <label style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                <input type="checkbox" checked={form.applyToSeries} onChange={e=>f('applyToSeries',e.target.checked)} /> {t.admin.applyToEventSeries}
              </label>
            </>
          )}
          <hr style={{margin:'1rem 0',border:'none',borderTop:'1px solid #eee'}} />
          <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
            <button type="button" onClick={saveEvent} disabled={saving}>{saving?'Ukladám…':'✅ Uložiť zmeny'}</button>
            <button type="button" style={{background:'#f0f0f0',color:'#333'}} onClick={closeModal}>Zatvoriť</button>
            <button type="button" style={{background:'#dc2626',color:'#fff'}} onClick={()=>void deleteEvent(editEvent.id)}>🗑 Zmazať</button>
            {editEvent.recurrenceGroupId && (
              <button type="button" style={{background:'#92400e',color:'#fff'}} onClick={()=>void deleteEvent(editEvent.id,true)}>🗑 Zmazať sériu</button>
            )}
          </div>
          {editEvent.recurrenceGroupId && (
            <>
              <hr style={{margin:'1rem 0',border:'none',borderTop:'1px solid #eee'}} />
              <p style={{fontWeight:700,marginBottom:'0.5rem',fontSize:'0.9rem'}}>Predĺžiť sériu o ďalšie opakovania</p>
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.75rem'}}>
                {WEEK_OPTS.map(d=>(
                  <label key={d.value} style={{display:'flex',gap:'4px',alignItems:'center',padding:'4px 8px',background:extendDays.includes(d.value as RepeatWeekday)?'#1a1a2e':'#f0f0f0',color:extendDays.includes(d.value as RepeatWeekday)?'#fff':'#333',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem',fontWeight:600}}>
                    <input type="checkbox" checked={extendDays.includes(d.value as RepeatWeekday)} onChange={e=>{setExtendDays(prev=>e.target.checked?[...prev,d.value as RepeatWeekday]:prev.filter(x=>x!==d.value));}} style={{display:'none'}} /> {d.label}
                  </label>
                ))}
              </div>
              <div style={{display:'flex',gap:'0.75rem',alignItems:'flex-end',flexWrap:'wrap'}}>
                <label style={{flex:1}}>Predĺžiť do
                  <input type="date" value={extendUntil} onChange={e=>setExtendUntil(e.target.value)} />
                </label>
                <button type="button" onClick={()=>void extendSeries()} disabled={extending||!extendUntil||extendDays.length===0}
                  style={{background:'#059669',color:'#fff',marginBottom:'0.5rem'}}>
                  {extending?'Pridávam…':'➕ Pridať opakovania'}
                </button>
              </div>
            </>
          )}
        </Overlay>
      )}
    </section>
  );
}
