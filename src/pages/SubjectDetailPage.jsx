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

  // Поля для новой оценки
  const [gName, setGName] = useState('');
  const [gScore, setGScore] = useState('');
  const [gMax, setGMax] = useState(100);
  const [gWeight, setGWeight] = useState(1);

  // Прогноз
  const [target, setTarget] = useState(75);
  const [nextMax, setNextMax] = useState(100);
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
    await subjectsApi.addGrade(id, {
      name: gName.trim(),
      score: Number(gScore),
      max_score: Number(gMax) || 100,
      weight: Number(gWeight) || 1
    });
    notifySuccess();
    setGName(''); setGScore(''); setGMax(100); setGWeight(1);
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
    const f = await subjectsApi.forecast(id, {
      target_percent: Number(target),
      next_max_score: Number(nextMax),
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

      {/* Сводка */}
      <div className="grade-summary glass">
        <div className="grade-summary-percent">
          {summary.gradesCount > 0 ? `Средний балл ${summary.percent}%` : 'Пока нет оценок'}
        </div>
        <div className="grade-summary-big">
          {summary.grade5 ?? '—'}
        </div>
        {summary.gradesCount > 0 && (
          <div className={'grade-summary-status ' + (summary.passed ? 'pass' : 'fail')}>
            {summary.passed ? '✓ Зачёт' : '✗ Не сдан (порог ' + subject.pass_threshold + '%)'}
          </div>
        )}
      </div>

      {/* Действия */}
      <div style={{ padding: '0 20px', display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { haptic('light'); setForecastOpen(true); }}>
          🎯 Прогноз
        </button>
        <button className="btn" style={{ flex: 1 }} onClick={() => { haptic('medium'); setAddOpen(true); }}>
          + Оценка
        </button>
      </div>

      {/* Список оценок */}
      <div className="section-title" style={{ marginTop: 24 }}>Оценки</div>

      {grades.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🎯</div>
          Нет оценок. Добавь первую!
        </div>
      ) : (
        <div style={{ padding: '0 20px' }}>
          {grades.map(g => {
            const percent = Math.round((g.score / g.max_score) * 100);
            return (
              <div key={g.id} className="grade-row glass" onClick={() => removeGrade(g.id)}>
                <div className="grade-row-info">
                  <div className="grade-row-name">{g.name}</div>
                  <div className="grade-row-meta">
                    {g.score} / {g.max_score} • вес {g.weight} • {percent}%
                  </div>
                </div>
                <div className="grade-row-value">{percent}%</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Кнопка удаления предмета */}
      <div style={{ padding: '24px 20px' }}>
        <button className="btn btn-danger btn-block" onClick={removeSubject}>
          Удалить предмет
        </button>
      </div>

      {/* Sheet: добавить оценку */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Новая оценка">
        <form onSubmit={addGrade}>
          <label className="field-label">Название</label>
          <div style={{ padding: '0 20px' }}>
            <input className="input" value={gName} onChange={e => setGName(e.target.value)}
              placeholder="Контрольная 1" required autoFocus />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px', marginTop: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>Балл</div>
              <input className="input" type="number" step="0.1" value={gScore}
                onChange={e => setGScore(e.target.value)} placeholder="80" required />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>Из</div>
              <input className="input" type="number" step="0.1" value={gMax}
                onChange={e => setGMax(e.target.value)} placeholder="100" />
            </div>
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

      {/* Sheet: прогноз */}
      <Sheet open={forecastOpen} onClose={() => { setForecastOpen(false); setForecast(null); }} title="Прогноз">
        <form onSubmit={calcForecast}>
          <div style={{ padding: '0 20px', fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 8 }}>
            Сколько нужно набрать в следующем задании, чтобы выйти на нужный процент
          </div>

          <label className="field-label">Целевой %</label>
          <div style={{ padding: '0 20px' }}>
            <input className="input" type="number" min="1" max="100" value={target}
              onChange={e => setTarget(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px', marginTop: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>Макс. балл</div>
              <input className="input" type="number" value={nextMax}
                onChange={e => setNextMax(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>Вес</div>
              <input className="input" type="number" step="0.1" value={nextWeight}
                onChange={e => setNextWeight(e.target.value)} />
            </div>
          </div>

          {forecast && (
            <div className="glass" style={{ margin: '16px 20px 0', padding: 16, textAlign: 'center' }}>
              {forecast.possible ? (
                <>
                  <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Нужно набрать</div>
                  <div style={{ fontSize: 36, fontWeight: 600, color: 'var(--accent)', margin: '4px 0' }}>
                    {forecast.neededScore}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                    ({forecast.neededPercent}% из {nextMax})
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--color-exam)', fontSize: 14 }}>
                  Цель {target}% уже {forecast.neededPercent < 0 ? 'достигнута' : 'недостижима'}
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
