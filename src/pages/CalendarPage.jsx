import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Calendar from '../components/Calendar';
import EventCard from '../components/EventCard';
import Sheet from '../components/Sheet';
import EventForm from './EventForm';
import { eventsApi, subjectsApi } from '../api/client';
import { dayjs, haptic, notifySuccess } from '../utils';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const [ev, subj] = await Promise.all([eventsApi.list(), subjectsApi.list()]);
      setEvents(ev);
      setSubjects(subj);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const upcoming = events
    .filter(e => dayjs(e.event_date).isSameOrAfter(dayjs().startOf('day')))
    .sort((a, b) => dayjs(a.event_date).diff(dayjs(b.event_date)))
    .slice(0, 5);

  const handleSave = async (data) => {
    try {
      if (editingEvent) {
        await eventsApi.update(editingEvent.id, data);
      } else {
        await eventsApi.create(data);
      }
      notifySuccess();
      setSheetOpen(false);
      setEditingEvent(null);
      load();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent || !confirm('Удалить событие?')) return;
    await eventsApi.remove(editingEvent.id);
    notifySuccess();
    setSheetOpen(false);
    setEditingEvent(null);
    load();
  };

  const openNew = () => {
    haptic('medium');
    setEditingEvent(null);
    setSheetOpen(true);
  };

  const openEdit = (event) => {
    haptic('light');
    setEditingEvent(event);
    setSheetOpen(true);
  };

  return (
    <div className="fade-in">
      <Header />

      <Calendar events={events} />

      <div className="section-title" style={{ marginTop: 20 }}>Ближайшие</div>

      {loading ? (
        <div className="empty">Загрузка…</div>
      ) : upcoming.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📭</div>
          Пока пусто. Добавь первое событие!
        </div>
      ) : (
        <div className="events-list">
          {upcoming.map(e => (
            <EventCard key={e.id} event={e} onClick={openEdit} />
          ))}
        </div>
      )}

      <button className="fab" onClick={openNew}>+</button>

      <Sheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditingEvent(null); }}
        title={editingEvent ? 'Редактировать событие' : 'Новое событие'}
      >
        <EventForm
          initial={editingEvent}
          subjects={subjects}
          onSave={handleSave}
          onDelete={editingEvent ? handleDelete : null}
          onCancel={() => { setSheetOpen(false); setEditingEvent(null); }}
        />
      </Sheet>
    </div>
  );
}
