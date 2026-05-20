import { useState, useMemo } from 'react';
import { dayjs, eventTypeColor, haptic } from '../utils';

export default function Calendar({ events = [], onDayClick }) {
  const [month, setMonth] = useState(dayjs());
  const [selectedDay, setSelectedDay] = useState(null);

  const today = dayjs();

  // События по дням текущего месяца
  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach(e => {
      const key = dayjs(e.event_date).format('YYYY-MM-DD');
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  // Генерируем сетку 6×7
  const grid = useMemo(() => {
    const startOfMonth = month.startOf('month');
    // Пн=0 ... Вс=6
    const firstDay = (startOfMonth.day() + 6) % 7;
    const start = startOfMonth.subtract(firstDay, 'day');

    return Array.from({ length: 42 }, (_, i) => {
      const d = start.add(i, 'day');
      return {
        date: d,
        isCurrentMonth: d.month() === month.month(),
        isToday: d.isSame(today, 'day'),
        isWeekend: [0, 6].includes(d.day()),
        events: eventsByDay[d.format('YYYY-MM-DD')] || []
      };
    });
  }, [month, eventsByDay]);

  const handleDayClick = (cell) => {
    haptic('light');
    setSelectedDay(cell.date.format('YYYY-MM-DD'));
    onDayClick?.(cell.date, cell.events);
  };

  return (
    <>
      <div className="calendar-strip">
        <div className="calendar-month">{month.format('MMMM YYYY')}</div>
        <div className="calendar-nav">
          <button
            className="calendar-nav-btn"
            onClick={() => { haptic('light'); setMonth(m => m.subtract(1, 'month')); }}
          >‹</button>
          <button
            className="calendar-nav-btn"
            onClick={() => { haptic('light'); setMonth(m => m.add(1, 'month')); }}
          >›</button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
          <div key={d} className="calendar-wd">{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {grid.map((cell, i) => {
          const dateKey = cell.date.format('YYYY-MM-DD');
          const classes = ['cal-day'];
          if (!cell.isCurrentMonth) classes.push('other');
          else if (cell.isWeekend) classes.push('weekend');
          if (cell.isToday) classes.push('today');
          if (selectedDay === dateKey) classes.push('selected');

          // Уникальные цвета событий (макс 3 точки)
          const colors = [...new Set(cell.events.map(e => eventTypeColor(e.type)))].slice(0, 3);

          return (
            <div
              key={i}
              className={classes.join(' ')}
              onClick={() => handleDayClick(cell)}
            >
              {cell.date.date()}
              {colors.length > 0 && (
                <div className="cal-dots">
                  {colors.map((c, idx) => (
                    <div key={idx} className="cal-dot" style={{ background: c }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item"><div className="legend-dot" style={{ background: '#e8745a' }} />Экзамен</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#6db8a0' }} />Зачёт</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#a89be0' }} />Контр.</div>
      </div>
    </>
  );
}
