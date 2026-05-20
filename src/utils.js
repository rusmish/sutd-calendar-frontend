import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.locale('ru');

export { dayjs };

export const EVENT_TYPES = {
  exam:    { label: 'Экзамен',     color: '#e8745a', icon: '📕' },
  credit:  { label: 'Зачёт',       color: '#6db8a0', icon: '📗' },
  test:    { label: 'Контрольная', color: '#a89be0', icon: '📘' },
  lecture: { label: 'Лекция',      color: '#f0d89a', icon: '📙' },
  other:   { label: 'Другое',      color: '#8e9ca8', icon: '📋' }
};

export function eventTypeColor(type) {
  return EVENT_TYPES[type]?.color || EVENT_TYPES.other.color;
}

export function eventTypeLabel(type) {
  return EVENT_TYPES[type]?.label || EVENT_TYPES.other.label;
}

export function percentToGrade5(percent) {
  if (percent >= 90) return 5;
  if (percent >= 75) return 4;
  if (percent >= 50) return 3;
  return 2;
}

export function haptic(type = 'light') {
  try {
    const tg = window.Telegram?.WebApp;
    tg?.HapticFeedback?.impactOccurred?.(type);
  } catch(e) {}
}

export function notifySuccess() {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
  } catch(e) {}
}