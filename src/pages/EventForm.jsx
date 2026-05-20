import { useState } from 'react';
import { EVENT_TYPES, dayjs } from '../utils';

export default function EventForm({ initial, subjects = [], onSave, onDelete, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [type, setType] = useState(initial?.type || 'exam');
  const [subjectId, setSubjectId] = useState(initial?.subject_id || '');
  const [date, setDate] = useState(
    initial?.event_date
      ? dayjs(initial.event_date).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD')
  );
  const [time, setTime] = useState(
    initial?.event_date
      ? dayjs(initial.event_date).format('HH:mm')
      : '10:00'
  );
  const [description, setDescription] = useState(initial?.description || '');

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      type,
      subject_id: subjectId ? Number(subjectId) : null,
      event_date: `${date}T${time}:00`,
      description: description.trim()
    });
  };

  return (
    <form onSubmit={submit}>
      <label className="field-label">Название</label>
      <div style={{ padding: '0 20px' }}>
        <input
          className="input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Экзамен по матанализу"
          required
        />
      </div>

      <label className="field-label">Тип</label>
      <div style={{ padding: '0 20px' }}>
        <select className="select" value={type} onChange={e => setType(e.target.value)}>
          {Object.entries(EVENT_TYPES).map(([key, t]) => (
            <option key={key} value={key}>{t.icon} {t.label}</option>
          ))}
        </select>
      </div>

      <label className="field-label">Предмет</label>
      <div style={{ padding: '0 20px' }}>
        <select className="select" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
          <option value="">— не привязан —</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px', marginTop: 14 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>Дата</div>
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>Время</div>
          <input className="input" type="time" value={time} onChange={e => setTime(e.target.value)} />
        </div>
      </div>

      <label className="field-label">Описание (необязательно)</label>
      <div style={{ padding: '0 20px' }}>
        <textarea
          className="textarea"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Аудитория, билеты, заметки…"
        />
      </div>

      <div className="sheet-actions">
        {onDelete && (
          <button type="button" className="btn btn-danger" onClick={onDelete}>
            Удалить
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }}>
          Отмена
        </button>
        <button type="submit" className="btn" style={{ flex: 1 }}>
          Сохранить
        </button>
      </div>
    </form>
  );
}
