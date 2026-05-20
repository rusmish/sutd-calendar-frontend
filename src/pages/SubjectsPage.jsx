import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SubjectCard from '../components/SubjectCard';
import Sheet from '../components/Sheet';
import { subjectsApi } from '../api/client';
import { haptic, notifySuccess } from '../utils';

const COLORS = ['#e8745a', '#6db8a0', '#a89be0', '#f0d89a', '#8e9ca8', '#7da3d8'];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState('');
  const [threshold, setThreshold] = useState(50);
  const [color, setColor] = useState(COLORS[0]);
  const navigate = useNavigate();

  async function load() {
    try {
      setLoading(true);
      const list = await subjectsApi.list();
      setSubjects(list);
      // Загружаем оценки по каждому предмету для отображения
      const sumMap = {};
      await Promise.all(
        list.map(async (s) => {
          try {
            const data = await subjectsApi.grades(s.id);
            sumMap[s.id] = data.summary;
          } catch {}
        })
      );
      setSummaries(sumMap);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await subjectsApi.create({ name: name.trim(), pass_threshold: threshold, color });
    notifySuccess();
    setName('');
    setThreshold(50);
    setColor(COLORS[0]);
    setSheetOpen(false);
    load();
  };

  return (
    <div className="fade-in">
      <Header />

      <div className="section-title" style={{ marginTop: 20 }}>Мои предметы</div>

      {loading ? (
        <div className="empty">Загрузка…</div>
      ) : subjects.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📚</div>
          Добавь предметы, чтобы вести оценки
        </div>
      ) : (
        <div className="subjects-grid">
          {subjects.map(s => (
            <SubjectCard
              key={s.id}
              subject={s}
              summary={summaries[s.id]}
              onClick={() => { haptic('light'); navigate(`/subjects/${s.id}`); }}
            />
          ))}
        </div>
      )}

      <button className="fab" onClick={() => { haptic('medium'); setSheetOpen(true); }}>+</button>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Новый предмет">
        <form onSubmit={create}>
          <label className="field-label">Название</label>
          <div style={{ padding: '0 20px' }}>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Высшая математика"
              required
              autoFocus
            />
          </div>

          <label className="field-label">Порог зачёта, %</label>
          <div style={{ padding: '0 20px' }}>
            <input
              className="input"
              type="number"
              min="1"
              max="100"
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
            />
          </div>

          <label className="field-label">Цвет</label>
          <div style={{ padding: '0 20px', display: 'flex', gap: 10 }}>
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: c,
                  border: color === c ? '2px solid #fff' : '0.5px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>

          <div className="sheet-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setSheetOpen(false)} style={{ flex: 1 }}>
              Отмена
            </button>
            <button type="submit" className="btn" style={{ flex: 1 }}>
              Добавить
            </button>
          </div>
        </form>
      </Sheet>
    </div>
  );
}
