import { percentToGrade5 } from '../utils';

export default function SubjectCard({ subject, summary, onClick }) {
  const hasGrades = summary && summary.gradesCount > 0;
  const grade = hasGrades ? summary.grade5 : null;
  const percent = hasGrades ? summary.percent : 0;

  // Цвет полоски по оценке
  const barColor =
    grade === 5 ? '#6db8a0' :
    grade === 4 ? '#f0d89a' :
    grade === 3 ? '#a89be0' :
    grade === 2 ? '#e8745a' : 'rgba(255,255,255,0.2)';

  return (
    <div className="subject-card glass" onClick={() => onClick?.(subject)}>
      <div className="subject-name">{subject.name}</div>

      {hasGrades ? (
        <>
          <div className="subject-grade">
            <span className="subject-grade-num">{grade}</span>
            <span className="subject-grade-max">/5</span>
          </div>
          <div className="subject-bar">
            <div
              className="subject-bar-fill"
              style={{ width: `${Math.min(100, percent)}%`, background: barColor }}
            />
          </div>
          <div className="subject-meta">{summary.percent}% • {summary.gradesCount} оценок</div>
        </>
      ) : (
        <>
          <div className="subject-grade-empty">Нет оценок</div>
          <div className="subject-bar">
            <div className="subject-bar-fill" style={{ width: '0%' }} />
          </div>
          <div className="subject-meta">Порог зачёта: {subject.pass_threshold}%</div>
        </>
      )}
    </div>
  );
}
