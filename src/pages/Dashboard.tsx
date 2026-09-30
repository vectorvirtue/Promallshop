import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Heart, 
  Wallet, 
  User, 
  Lock, 
  LogOut, 
  Copy, 
} from 'lucide-react';
import styles from './Dashboard.module.css';
import Breadcrumb from '../components/Breadcrumb';
import { WishlistPanel } from './Wishlist';
import { AccountDetails } from './AccountDetails';
import { ChangePassword } from './ChangePassword';
import OrdersPanel from './Orders';
import { useAuth } from '../context/AuthContext';
import { setLoginRedirect } from '../lib/redirect';
import earnings from "../assets/hugeicons_affiliate.svg"

/** breadcrumb label per sidebar tab */
const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  orders: 'Orders',
  wishlist: 'Wishlist',
  wallet: 'Wallet',
  account: 'Account Details',
  password: 'Change Password',
}

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [copied, setCopied] = useState<boolean>(false);

  const referralLink = 'jane_qv34';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* signed out users go to the login page, then come back here */
  useEffect(() => {
    if (!isAuthenticated) {
      setLoginRedirect('/dashboard');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  if (!isAuthenticated) return null;

  const firstName = (user?.name ?? '').trim().split(' ')[0];
  const initials = (user?.name ?? 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'U';

  return (
    <div className={styles.page}>
      <Breadcrumb
        className={styles.breadcrumb}
        items={[{ label: 'Account' }, { label: TAB_LABELS[activeTab] ?? 'Dashboard' }]}
      />
      <div className={styles.dashboardContainer}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.profileSection}>
          <div className={styles.avatarWrapper}>
            <span className={styles.avatarInitials} aria-label={user?.name ?? 'Account'}>
              {initials}
            </span>
          </div>
          <h2 className={styles.welcomeText}>Welcome {firstName || 'there'}</h2>
        </div>

        <nav className={styles.navigation}>
          <button 
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard className={styles.navIcon} size={20} />
            <span>Dashboard</span>
          </button>

          <button 
            className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ClipboardList className={styles.navIcon} size={20} />
            <span>Orders</span>
          </button>

          <button 
            className={`${styles.navItem} ${activeTab === 'wishlist' ? styles.active : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Heart className={styles.navIcon} size={20} />
            <span>Wishlist</span>
          </button>

          <button 
            className={`${styles.navItem} ${activeTab === 'wallet' ? styles.active : ''}`}
            onClick={() => setActiveTab('wallet')}
          >
            <Wallet className={styles.navIcon} size={20} />
            <span>Wallet</span>
          </button>

          <button 
            className={`${styles.navItem} ${activeTab === 'account' ? styles.active : ''}`}
            onClick={() => setActiveTab('account')}
          >            <User className={styles.navIcon} size={20} />
            <span>Account details</span>
          </button>

          <button 
            className={`${styles.navItem} ${activeTab === 'password' ? styles.active : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <Lock className={styles.navIcon} size={20} />
            <span>Change password</span>
          </button>

          <button 
            className={`${styles.navItem} ${styles.logout}`}
            onClick={handleLogout}
          >
            <LogOut className={styles.navIcon} size={20} />
            <span>Log Out</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {activeTab === 'orders' ? (
          /* -- Orders -- */
          <OrdersPanel />
        ) : activeTab === 'wishlist' ? (
          /* -- Wishlist -- */
          <WishlistPanel />
        ) : activeTab === 'account' ? (
          /* -- Account details -- */
          <AccountDetails />
        ) : activeTab === 'password' ? (
          /* -- Change password -- */
          <ChangePassword />
        ) : (
          <>
            {/* Upper Dashboard Details */}
            <section className={styles.overviewCard}>
              <h1 className={styles.sectionTitle}>Dashboard</h1>
              <hr className={styles.divider} />

              <div className={styles.infoGroup}>
                <label className={styles.fieldLabel}>Wallet</label>
                <div className={styles.fieldBox}>
                  <span className={styles.currency}>₦</span>0.00
                </div>
              </div>

              <div className={styles.infoGroup}>
                <label className={styles.fieldLabel}>Credit</label>
                <div className={styles.fieldBox}>
                  <span className={styles.currency}>₦</span>0.00
                </div>
              </div>

              <div className={styles.couponSection}>
                <h3 className={styles.subTitle}>Active Coupon Codes</h3>
                <div className={styles.tableHeader}>
                  <span>Code</span>
                  <span>Amount</span>
                </div>
                <div className={`${styles.fieldBox} ${styles.couponRow}`}>
                  <span className={styles.codeText}>Nil</span>
                  <span className={styles.amountText}><span className={styles.currency}>₦</span>0.00</span>
                </div>
              </div>
            </section>

            {/* Affiliate Banner Card */}
            <section className={styles.affiliateCard}>
              <div className={styles.affiliateTop}>
                <div>
                  <h2 className={styles.affiliateTitle}>Affiliate Overview</h2>
                  <p className={styles.affiliateSub}>Earn commissions by sharing your referral link!</p>
                </div>
                <div className={styles.statusBadge}>
                  <span className={styles.statusDot}></span>
                  <span>Active</span>
                  <span className={styles.statusSubtext}>Affiliate status</span>
                </div>
              </div>

              <div className={styles.referralBox}>
                <span className={styles.referralLabel}>Copy your affiliate link</span>
                <div className={styles.linkWrapper}>
                  <span className={styles.linkText}>{referralLink}</span>
                  <button className={styles.copyBtn} onClick={handleCopy} title={copied ? 'Copied!' : 'Copy link'}>
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div className={styles.affiliateBottom}>
                <button className={styles.viewMoreBtn}>View More Info</button>

                <div className={styles.earningsContainer}>
                  <div className={styles.earningsIconBox}>
                    <img src={earnings} alt="earningicon" />
                  </div>
                  <div className={styles.earningsDetails}>
                    <div className={styles.earningsAmount}>
                      <span className={styles.currency}>₦</span>25,580.60
                    </div>
                    <div className={styles.earningsLabel}>Your referral earnings</div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      </div>
    </div>
  );
};

export default Dashboard;
