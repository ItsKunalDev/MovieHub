import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiHeart, FiBookmark, FiCamera } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useFavorites } from '../context/FavoritesContext';
import { auth, updateProfile } from '../firebase';
import MovieCard from '../components/MovieCard';
import './Profile.css';

export default function Profile() {
  const { user, authLoading } = useAuth();
  const { watchlist } = useWatchlist();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(location.state?.tab || 'details');
  const [form, setForm] = useState({
    username: '',
    name: '',
    mobile: '',
    email: '',
  });
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }
    
    if (user) {
      // Load extra profile data from localStorage
      const savedData = JSON.parse(localStorage.getItem(`userProfile_${user.uid}`)) || {};
      
      setForm({
        username: savedData.username || '',
        name: user.displayName || savedData.name || '',
        mobile: savedData.mobile || '',
        email: user.email || '',
      });
      setPhotoURL(savedData.photoURL || user.photoURL || '');
    }
  }, [user, authLoading, navigate]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || !auth.currentUser) return;
    setLoading(true);
    try {
      // Update Firebase Profile (Name only to prevent base64 length errors)
      await updateProfile(auth.currentUser, {
        displayName: form.name,
      });

      // Update LocalStorage for custom fields and photo
      localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify({
        username: form.username,
        name: form.name,
        mobile: form.mobile,
        photoURL: photoURL
      }));
      
      alert('Profile updated successfully!');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="profile-page"><div className="profile-container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div></div>;
  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        {/* Sidebar */}
        <div className="profile-sidebar">
          <button 
            className={`profile-sidebar-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <FiUser /> Profile Details
          </button>
          <button 
            className={`profile-sidebar-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <FiHeart /> Favorite Movies
          </button>
          <button 
            className={`profile-sidebar-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            <FiBookmark /> Watch Later
          </button>
        </div>

        {/* Content Area */}
        <div className="profile-content">
          
          {activeTab === 'details' && (
            <div>
              <h2>Profile Details</h2>
              <form className="profile-form" onSubmit={handleSave}>
                <div className="profile-photo-section">
                  <div className="profile-photo">
                    {photoURL ? (
                      <img src={photoURL} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <FiUser />
                    )}
                  </div>
                  <div className="profile-photo-upload">
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      onChange={handlePhotoChange} 
                    />
                    <button 
                      type="button" 
                      className="upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FiCamera style={{ marginRight: '8px' }}/> Change Photo
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    placeholder="Enter your username" 
                    value={form.username}
                    onChange={(e) => updateForm('username', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number</label>
                  <input 
                    type="tel" 
                    placeholder="Enter mobile number" 
                    value={form.mobile}
                    onChange={(e) => updateForm('mobile', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Email ID</label>
                  <input 
                    type="email" 
                    value={form.email}
                    disabled
                  />
                </div>

                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <h2>Favorite Movies</h2>
              {favorites.length === 0 ? (
                <div className="profile-empty">
                  <FiHeart />
                  <p>You haven't added any favorite movies yet.</p>
                </div>
              ) : (
                <div className="profile-movies-grid">
                  {favorites.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'watchlist' && (
            <div>
              <h2>Watch Later</h2>
              {watchlist.length === 0 ? (
                <div className="profile-empty">
                  <FiBookmark />
                  <p>Your watch later list is empty.</p>
                </div>
              ) : (
                <div className="profile-movies-grid">
                  {watchlist.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
