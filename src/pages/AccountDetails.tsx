import React, { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import styles from './AccountDetails.module.css';
import { useAuth } from '../context/AuthContext';

interface AccountFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  defaultAddress: string;
}

const EMPTY: AccountFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  defaultAddress: '',
};

const ALL_DISABLED: Record<keyof AccountFormData, boolean> = {
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  defaultAddress: true,
};

export const AccountDetails: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth();

  // seed the form from the signed-in user, and re-seed if the user changes
  const [formData, setFormData] = useState<AccountFormData>(EMPTY);
  const [disabledFields, setDisabledFields] = useState<Record<keyof AccountFormData, boolean>>(ALL_DISABLED);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!user) return;
    const [firstName = '', ...rest] = (user.name ?? '').trim().split(/\s+/);
    setFormData(prev => ({
      ...prev,
      firstName,
      lastName: rest.join(' '),
      email: user.email ?? '',
      phoneNumber: user.phone ?? '',
      defaultAddress: user.address ?? '',
    }));
  }, [user]);

  const handleInputChange = (field: keyof AccountFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEdit = (field: keyof AccountFormData) => {
    setDisabledFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      await updateProfile({
        name,
        email: formData.email,
        phone: formData.phoneNumber,
        // no column for this yet — sent anyway so it persists once the backend adds it
        address: formData.defaultAddress,
      });
      setDisabledFields(ALL_DISABLED);
      toast.success('Account details saved');
    } catch (err) {
      // validation and auth errors come back with a real message now
      setSaveError(err instanceof Error ? err.message : 'Could not save your details.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSaveError('');
    setDisabledFields(ALL_DISABLED);
  };

  const locked = saving || isLoading;

  return (
    <div className={styles.cardContainer}>
      <h2 className={styles.cardTitle}>Account details</h2>
      <hr className={styles.divider} />

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        {/* First Name & Last Name Row */}
        <div className={styles.gridRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="firstName" className={styles.label}>
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              className={styles.input}
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              disabled={disabledFields.firstName}
            />
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => toggleEdit('firstName')}
            >
              <span>Edit</span>
              <Pencil size={14} className={styles.pencilIcon} />
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="lastName" className={styles.label}>
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              className={styles.input}
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              disabled={disabledFields.lastName}
            />
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => toggleEdit('lastName')}
            >
              <span>Edit</span>
              <Pencil size={14} className={styles.pencilIcon} />
            </button>
          </div>
        </div>

        {/* Email & Phone Number Row */}
        <div className={styles.gridRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={disabledFields.email}
            />
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => toggleEdit('email')}
            >
              <span>Edit</span>
              <Pencil size={14} className={styles.pencilIcon} />
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phoneNumber" className={styles.label}>
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              className={styles.input}
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              disabled={disabledFields.phoneNumber}
            />
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => toggleEdit('phoneNumber')}
            >
              <span>Edit</span>
              <Pencil size={14} className={styles.pencilIcon} />
            </button>
          </div>
        </div>

        {/* Default Address Full Width */}
        <div className={styles.inputGroupFull}>
          <label htmlFor="defaultAddress" className={styles.label}>
            Default Address
          </label>
          <input
            id="defaultAddress"
            type="text"
            className={styles.input}
            value={formData.defaultAddress}
            onChange={(e) => handleInputChange('defaultAddress', e.target.value)}
            disabled={disabledFields.defaultAddress}
          />
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => toggleEdit('defaultAddress')}
          >
            <span>Edit</span>
            <Pencil size={14} className={styles.pencilIcon} />
          </button>
        </div>

        <hr className={styles.divider} />

        {/* Footer Actions */}
        <div className={styles.actionRow}>
          {saveError && <p className={styles.errorText}>{saveError}</p>}
          <button type="button" className={styles.cancelBtn} onClick={handleCancel} disabled={locked}>
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn} disabled={locked}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountDetails;