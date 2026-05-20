import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SubjectCard from '../components/SubjectCard';
import { subjectsApi } from '../api/client';
import { haptic, percentToGrade5 } from '../utils';

export default function GradesPage() {
  const [subjects, setSubjects] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    const list = await subjectsApi.list();
    setSubjects(list);
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
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Общий средний балл по всем предметам с оценками
  const withGrades = subjects.filter(s => summaries[s.id]?.gradesCount > 0);
  const avgPercent = withGrades.length > 0
    ? withGrades.reduce((sum, s) => sum + summaries[s.id].percent, 0) / withGrades.length
    : 0;
  const avgGrade = percentToGrade5(avgPercent);

  return (
    <div className="fade-in">
      <Header />

      {/* Общая сводка */}
      <div className="grade-summary glass" style={{ margin: '20px' }}>
        <div className="grade-summary-percent">
          {withGrades.length > 0 ? `Средний по ${withGrades.length} предметам` : 'Нет оценок'}
        </div>
        <div className="grade-summary-big">
          {withGrades.length > 0 ? avgGrade : '—'}
        </div>
        {withGrades.length > 0 && (
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 8 }}>
            {avgPercent.toFixed(1)}%
          </div>
        )}
      </div>

      <div className="section-title">По предметам</div>

      {loading ? (
        <div className="empty">Загрузка…</div>
      ) : subjects.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🎯</div>
          Добавь предметы во вкладке «Предметы»
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
    </div>
  );
}
