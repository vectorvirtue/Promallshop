import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import styles from './ChangePassword.module.css';
import { useAuth } from '../context/AuthContext';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

export const ChangePassword: React.FC = () => {
  const { changePassword, isLoading } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof typeof EMPTY, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setFormError('');
  };

  const toggle = (field: keyof typeof visible) => {
    setVisible(prev => ({ ...prev, [field]: !prev[field] }));
  };

  /** catches the obvious problems before spending a request */
  const validate = () => {
    const next: Partial<Record<keyof typeof EMPTY, string>> = {};

    if (!form.currentPassword) next.currentPassword = 'Enter your current password.';
    if (!form.newPassword) next.newPassword = 'Enter a new password.';
    else if (form.newPassword.length < 8) next.newPassword = 'Use at least 8 characters.';
    if (!form.confirmPassword) next.confirmPassword = 'Confirm your new password.';
    else if (form.newPassword !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match.';
    } else if (form.newPassword === form.currentPassword) {
      next.newPassword = 'New password must be different from the current one.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setFormError('');
    try {
      await changePassword(form.currentPassword, form.newPassword, form.confirmPassword);
      setForm(EMPTY);
      setVisible({ current: false, next: false, confirm: false });
      toast.success('Password changed', { description: 'Use your new password the next time you sign in.' });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not change your password.');
    } finally {
      setSaving(false);
    }
  };

  const locked = saving || isLoading;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Change password</h2>
      </div>

      <hr className={styles.divider} />

      <form onSubmit={handleSubmit} noValidate>
        {/* current password */}
        <div className={styles.group}>
          <label className={styles.label} htmlFor="currentPassword">Current Password</label>
          <div className={`${styles.inputWrap} ${errors.currentPassword ? styles.invalid : ''}`}>
            <input
              id="currentPassword"
              type={visible.current ? 'text' : 'password'}
              className={styles.input}
              value={form.currentPassword}
              onChange={e => handleChange('currentPassword', e.target.value)}
              autoComplete="current-password"
              placeholder="Enter current password"
              disabled={locked}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => toggle('current')}
              aria-label={visible.current ? 'Hide password' : 'Show password'}
            >
              {visible.current ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.currentPassword && <p className={styles.error}>{errors.currentPassword}</p>}
        </div>

        {/* new password */}
        <div className={styles.group}>
          <label className={styles.label} htmlFor="newPassword">New Password</label>
          <div className={`${styles.inputWrap} ${errors.newPassword ? styles.invalid : ''}`}>
            <input
              id="newPassword"
              type={visible.next ? 'text' : 'password'}
              className={styles.input}
              value={form.newPassword}
              onChange={e => handleChange('newPassword', e.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              disabled={locked}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => toggle('next')}
              aria-label={visible.next ? 'Hide password' : 'Show password'}
            >
              {visible.next ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPassword && <p className={styles.error}>{errors.newPassword}</p>}
        </div>

        {/* confirm password */}
        <div className={styles.group}>
          <label className={styles.label} htmlFor="confirmPassword">Confirm New Password</label>
          <div className={`${styles.inputWrap} ${errors.confirmPassword ? styles.invalid : ''}`}>
            <input
              id="confirmPassword"
              type={visible.confirm ? 'text' : 'password'}
              className={styles.input}
              value={form.confirmPassword}
              onChange={e => handleChange('confirmPassword', e.target.value)}
              autoComplete="new-password"
              placeholder="Re-enter new password"
              disabled={locked}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => toggle('confirm')}
              aria-label={visible.confirm ? 'Hide password' : 'Show password'}
            >
              {visible.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword}</p>}
        </div>

        {formError && <p className={styles.formError}>{formError}</p>}

        <button type="submit" className={styles.saveBtn} disabled={locked}>
          {saving ? 'Saving…' : 'Save Password'}
        </button>

        <p className={styles.note}>
          <ShieldCheck size={14} />
          You will stay signed in on this device after changing your password.
        </p>
      </form>
    </div>
  );
};

export default ChangePassword;
