import { dayjs, eventTypeColor, eventTypeLabel } from '../utils';

export default function EventCard({ event, onClick }) {
  const color = eventTypeColor(event.type);
  const date = dayjs(event.event_date);

  return (
    <div className="event-card glass" onClick={() => onClick?.(event)}>
      <div className="event-bar" style={{ background: color }} />
      <div className="event-body">
        <div className="event-title">{event.title || eventTypeLabel(event.type)}</div>
        <div className="event-subject">
          {event.subject_name || eventTypeLabel(event.type)}
          {event.event_date ? ` • ${date.format('HH:mm')}` : ''}
        </div>
      </div>
      <div className="event-date-badge">
        <div className="event-date-day">{date.format('D')}</div>
        <div className="event-date-month">{date.format('MMM')}</div>
      </div>
    </div>
  );
}
