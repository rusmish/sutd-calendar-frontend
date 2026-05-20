import { dayjs } from '../utils';

function getGreeting(hour) {
  if (hour < 6) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export default function Header({ user }) {
  const greeting = getGreeting(dayjs().hour());
  const initials = user?.first_name
    ? user.first_name.slice(0, 1).toUpperCase() + (user.last_name?.[0]?.toUpperCase() || '')
    : 'СТ';

  return (
    <header className="app-header">
      <div>
        <div className="app-header-greeting">{greeting}</div>
        <div className="app-header-title">СПбГУПТД</div>
      </div>
      <div className="app-header-avatar">{initials}</div>
    </header>
  );
}
