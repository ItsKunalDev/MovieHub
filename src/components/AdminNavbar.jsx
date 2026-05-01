import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiMail, FiPhone, FiUser, FiShield, FiChevronDown, FiPhoneCall, FiHelpCircle } from 'react-icons/fi';
import { MdLocalMovies } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import './AdminNavbar.css';

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayName = user?.displayName || user?.name || 'Admin';
  const email = user?.email || '—';
  const initial = displayName[0]?.toUpperCase() || 'A';

  return (
    <nav className="admin-navbar">
      <Link to="/admin" className="admin-nav-brand">
        <div className="admin-nav-logo-wrap">
          <MdLocalMovies className="admin-nav-logo-icon" />
        </div>
        <div className="admin-nav-brand-text">
          <span className="admin-nav-site-name">MovieHub</span>
          <span className="admin-nav-badge"><FiShield /> Admin Panel</span>
        </div>
      </Link>

      <div className="admin-nav-right" ref={dropdownRef}>
        <button className="admin-nav-profile-btn" onClick={() => setProfileOpen(p => !p)} aria-label="Toggle profile">
          <div className="admin-nav-avatar">
            {user?.photoURL
              ? <img src={user.photoURL} alt={displayName} referrerPolicy="no-referrer" />
              : <span>{initial}</span>
            }
            <span className="admin-nav-avatar-online" />
          </div>
          <div className="admin-nav-profile-info">
            <span className="admin-nav-profile-name">{displayName}</span>
            <span className="admin-nav-profile-role">Administrator</span>
          </div>
          <FiChevronDown className={`admin-nav-chevron ${profileOpen ? 'open' : ''}`} />
        </button>

        {profileOpen && (
          <div className="admin-nav-dropdown">
            <div className="admin-nav-dropdown-header">
              <div className="admin-nav-dropdown-avatar">
                {user?.photoURL
                  ? <img src={user.photoURL} alt={displayName} referrerPolicy="no-referrer" />
                  : <span>{initial}</span>
                }
              </div>
              <div>
                <p className="admin-dd-name">{displayName}</p>
                <p className="admin-dd-role"><FiShield /> Administrator</p>
              </div>
            </div>

            <div className="admin-nav-divider" />

            <div className="admin-dd-info-list">
              <div className="admin-dd-info-row">
                <FiUser className="admin-dd-icon" />
                <div>
                  <span className="admin-dd-label">Full Name</span>
                  <span className="admin-dd-value">{displayName}</span>
                </div>
              </div>
              <div className="admin-dd-info-row">
                <FiMail className="admin-dd-icon" />
                <div>
                  <span className="admin-dd-label">Email Address</span>
                  <span className="admin-dd-value">{email}</span>
                </div>
              </div>
              <div className="admin-dd-info-row">
                <FiPhone className="admin-dd-icon" />
                <div>
                  <span className="admin-dd-label">Contact Number</span>
                  <span className="admin-dd-value">{user?.phoneNumber || 'Not provided'}</span>
                </div>
              </div>
              <div className="admin-dd-info-row">
                <FiPhoneCall className="admin-dd-icon" />
                <div>
                  <span className="admin-dd-label">Contact Us</span>
                  <a href="tel:+91123456789" className="admin-dd-value admin-dd-link">+91 123456789</a>
                </div>
              </div>
              <div className="admin-dd-info-row">
                <FiHelpCircle className="admin-dd-icon" />
                <div>
                  <span className="admin-dd-label">Help Center</span>
                  <a href="mailto:moviehubsupport@gmail.com" className="admin-dd-value admin-dd-link">moviehubsupport@gmail.com</a>
                </div>
              </div>
            </div>

            <div className="admin-nav-divider" />

            <button className="admin-dd-logout" onClick={handleLogout}>
              <FiLogOut /> Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
