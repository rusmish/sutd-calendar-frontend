import { NavLink } from 'react-router-dom';
import { haptic } from '../utils';

const TABS = [
  { to: '/',          icon: '📅', label: 'Календарь' },
  { to: '/subjects',  icon: '📚', label: 'Предметы' },
  { to: '/grades',    icon: '🎯', label: 'Оценки' },
  { to: '/profile',   icon: '👤', label: 'Профиль' }
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {TABS.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            onClick={() => haptic('light')}
            className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')}
          >
            <span className="nav-tab-icon">{t.icon}</span>
            <span>{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
