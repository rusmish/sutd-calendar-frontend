import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { meApi } from '../api/client';
import { notifySuccess, haptic } from '../utils';

export default function ProfilePage() {
  const [me, setMe] = useState(null);
  const [notifyDays, setNotifyDays] = useState('7,3,1');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    meApi.get().then(u => {
      setMe(u);
      setNotifyDays(u.notify_days || '7,3,1');
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await meApi.update({ notify_days: notifyDays });
      notifySuccess();
    } finally {
      setSaving(false);
    }
  };

  const tg = window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;

  return (
    <div className="fade-in">
      <Header />

      {/* Карточка пользователя */}
      <div className="glass" style={{ margin: '20px', padding: '20px', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--accent-soft)', border: '1.5px solid var(--accent-border)',
          margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)', fontSize: 26, fontWeight: 600
        }}>
          {(tgUser?.first_name || 'С')[0].toUpperCase()}
        </div>
        <div style={{ fontSize: 16, fontWeight: 500 }}>
          {tgUser?.first_name || 'Студент'} {tgUser?.last_name || ''}
        </div>
        {tgUser?.username && (
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>
            @{tgUser.username}
          </div>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
          СПбГУПТД
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 24 }}>Уведомления</div>

      <form onSubmit={save}>
        <div style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '0 20px', marginBottom: 8 }}>
          За сколько дней до события присылать напоминания (через запятую)
        </div>

        <div style={{ padding: '0 20px' }}>
          <input
            className="input"
            value={notifyDays}
            onChange={e => setNotifyDays(e.target.value)}
            placeholder="7,3,1"
            pattern="[0-9, ]+"
          />
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '12px 20px 0', flexWrap: 'wrap' }}>
          {['7,3,1', '14,7,3,1', '3,1', '1'].map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => { haptic('light'); setNotifyDays(preset); }}
              style={{
                background: notifyDays === preset ? 'var(--accent-soft)' : 'var(--glass-bg)',
                border: '0.5px solid ' + (notifyDays === preset ? 'var(--accent-border)' : 'var(--glass-border)'),
                color: notifyDays === preset ? 'var(--accent)' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 14px',
                fontSize: 13,
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              {preset}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px' }}>
          <button type="submit" className="btn btn-block" disabled={saving}>
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </form>

      <div style={{ padding: '0 20px 20px', textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
        Уведомления приходят прямо в Telegram
      </div>
    </div>
  );
}
