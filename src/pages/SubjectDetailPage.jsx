import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sheet from '../components/Sheet';
import { subjectsApi, gradesApi } from '../api/client';
import { haptic, notifySuccess } from '../utils';

export default function SubjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [forecastOpen, setForecastOpen] = useState(false);

  const [gName, setGName] = useState('');
  const [gScore, setGScore] = useState('');
  const [gWeight, setGWeight] = useState(1);

  const [target, setTarget] = useState(4);
  const [nextWeight, setNextWeight] = useState(1);
  const [forecast, setForecast] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const res = await subjectsApi.grades(id);
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  const addGrade = async (e) => {
    e.preventDefault();
    if (!gName.trim() || gScore === '') return;
    const score5 = Number(gScore);
    if (score5 < 1 || score5 > 5) return alert('Оценка должна быть от 1 до 5');
    await subjectsApi.addGrade(id, {
      name: gName.trim(),
      score: score5 * 20,
      max_score: 100,
      weight: Number(gWeight) || 1
    });
    notifySuccess();
    setGName(''); setGScore(''); setGWeight(1);
    setAddOpen(false);
    load();
  };

  const removeGrade = async (gradeId) => {
    if (!confirm('Удалить оценку?')) return;
    await gradesApi.remove(gradeId);
    notifySuccess();
    load();
  };

  const calcForecast = async (e) => {
    e.preventDefault();
    const targetPercent = Number(target) * 20;
    const f = await subjectsApi.forecast(id, {
      target_percent: targetPercent,
      next_max_score: 100,
      next_weight: Number(nextWeight)
    });
    setForecast(f);
  };

  const removeSubject = async () => {
    if (!confirm('Удалить предмет со всеми оценками?')) return;
    await subjectsApi.remove(id);
    notifySuccess();
    navigate('/subjects');
  };

  if (loading || !data) return <div className="empty">Загрузка…</div>;

  const { subject, grades, summary } = data;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-back" onClick={() => { haptic('light'); navigate(-1); }}>‹</div>
        <div className="page-title">{subject.name}</div>
      </div>

      <div className="grade-summary glass">
        <div className="grade-summary-percent">
          {summary.gradesCount > 0 ? 'Средний балл' : 'Пока нет оценок'}
        </div>
        <div className="grade-summary-big">
          {summary.grade5 ?? '—'}
        </div>
        {summary.gradesCount > 0 && (
          <div className={'grade-summary-status ' + (summary.passed ? 'pass' : 'fail')}>
            {summary.passed ? '✓ Зачёт' : '✗ Не сдан'}
          </div>
        )}
      </div>

      <div style={{ padding: '0 20px', display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { haptic('light'); setForecastOpen(true); }}>
          🎯 Прогноз
        </button>
        <button className="btn" style={{ flex: 1 }} onClick={() => { haptic('medium'); setAddOpen(true); }}>
          + Оценка
        </button>
      </div>

      <div className="section-title" style={{ marginTop: 24 }}>Оценки</div>

      {grades.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🎯</div>
          Нет оценок. Добавь первую!
        </div>
      ) : (
        <div style={{ padding: '0 20px' }}>
          {grades.map(g => {
            const grade5 = Math.round(g.score / 20);
            return (
              <div key={g.id} className="grade-row glass" onClick={() => removeGrade(g.id)}>
                <div className="grade-row-info">
                  <div className="grade-row-name">{g.name}</div>
                  <div className="grade-row-meta">вес {g.weight}</div>
                </div>
                <div className="grade-row-value">{grade5}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ padding: '24px 20px' }}>
        <button className="btn btn-danger btn-block" onClick={removeSubject}>
          Удалить предмет
        </button>
      </div>

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Новая оценка">
        <form onSubmit={addGrade}>
          <label className="field-label">Название</label>
          <div style={{ padding: '0 20px' }}>
            <input className="input" value={gName} onChange={e => setGName(e.target.value)}
              placeholder="Контрольная 1" required autoFocus />
          </div>

          <label className="field-label">Оценка (1–5)</label>
          <div style={{ padding: '0 20px' }}>
            <input className="input" type="number" min="1" max="5" step="1" value={gScore}
              onChange={e => setGScore(e.target.value)} placeholder="5" required />
          </div>

          <label className="field-label">Вес (1 = обычный)</label>
          <div style={{ padding: '0 20px' }}>
            <input className="input" type="number" step="0.1" min="0.1" value={gWeight}
              onChange={e => setGWeight(e.target.value)} />
          </div>

          <div className="sheet-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setAddOpen(false)} style={{ flex: 1 }}>
              Отмена
            </button>
            <button type="submit" className="btn" style={{ flex: 1 }}>Добавить</button>
          </div>
        </form>
      </Sheet>

      <Sheet open={forecastOpen} onClose={() => { setForecastOpen(false); setForecast(null); }} title="Прогноз">
        <form onSubmit={calcForecast}>
          <div style={{ padding: '0 20px', fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 8 }}>
            Какую оценку нужно получить, чтобы выйти на нужный средний балл
          </div>

          <label className="field-label">Целевой средний балл (1–5)</label>
          <div style={{ padding: '0 20px' }}>
            <input className="input" type="number" min="1" max="5" step="1" value={target}
              onChange={e => setTarget(e.target.value)} />
          </div>

          <label className="field-label">Вес следующей оценки</label>
          <div style={{ padding: '0 20px' }}>
            <input className="input" type="number" step="0.1" value={nextWeight}
              onChange={e => setNextWeight(e.target.value)} />
          </div>

          {forecast && (
            <div className="glass" style={{ margin: '16px 20px 0', padding: 16, textAlign: 'center' }}>
              {forecast.possible ? (
                <>
                  <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Нужно получить</div>
                  <div style={{ fontSize: 36, fontWeight: 600, color: 'var(--accent)', margin: '4px 0' }}>
                    {Math.ceil(forecast.neededScore / 20)}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>из 5</div>
                </>
              ) : (
                <div style={{ color: 'var(--color-exam)', fontSize: 14 }}>
                  Цель {target} уже {forecast.neededPercent < 0 ? 'достигнута' : 'недостижима'}
                </div>
              )}
            </div>
          )}

          <div className="sheet-actions">
            <button type="button" className="btn btn-ghost" onClick={() => { setForecastOpen(false); setForecast(null); }} style={{ flex: 1 }}>
              Закрыть
            </button>
            <button type="submit" className="btn" style={{ flex: 1 }}>Рассчитать</button>
          </div>
        </form>
      </Sheet>
    </div>
  );
}
