import { useState, useEffect } from 'react';
import { FiPlus, FiImage, FiVideo, FiX, FiCheckCircle, FiEdit2, FiTrash2, FiFilm, FiUpload } from 'react-icons/fi';
import { collection, addDoc, serverTimestamp, onSnapshot, orderBy, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { uploadMedia } from '../uploadMedia';
import { useAuth } from '../context/AuthContext';
import AdminChat from '../components/AdminChat';
import './Admin.css';

const CustomFileUpload = ({ id, accept, onChange, labelText, icon: Icon, selectedFile, progress, isUploading }) => (
  <div className="custom-file-upload">
    <input id={id} type="file" accept={accept} onChange={(e) => onChange(e.target.files[0])} className="hidden-file-input" />
    <label htmlFor={id} className={`file-upload-label ${selectedFile ? 'ready' : ''}`}>
      {selectedFile ? (
        <div className="upload-state ready-state"><FiCheckCircle className="file-icon" /><span>{selectedFile.name}</span></div>
      ) : (
        <div className="upload-state default-state"><Icon className="file-icon" /><span>{labelText}</span></div>
      )}
    </label>
    {(isUploading || progress > 0) && progress <= 100 && (
      <div className="progress-container">
        <div className="progress-text">{progress === 100 ? 'Complete' : `${Math.round(progress)}%`}</div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      </div>
    )}
  </div>
);

const CustomSelect = ({ value, onChange, options, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value) || options[0];
  return (
    <div className="custom-select-container">
      <div className={`custom-select-header ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`} onClick={() => !disabled && setIsOpen(!isOpen)}>
        <span>{selectedOption.label}</span>
        <svg className={`custom-select-arrow ${isOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
      </div>
      {isOpen && !disabled && (
        <>
          <div className="custom-select-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
          <div className="custom-select-options">
            {options.map(option => (
              <div key={option.value} className={`custom-select-option ${value === option.value ? 'selected' : ''}`} onClick={() => { onChange(option.value); setIsOpen(false); }}>
                {option.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const MovieCard = ({ movie, onEdit, onDelete, onUploadMedia }) => (
  <div className="admin-movie-card">
    <div className="admin-movie-thumb">
      {movie.thumbnailURL
        ? <img src={movie.thumbnailURL} alt={movie.title} />
        : <div className="admin-movie-thumb-placeholder"><FiFilm /></div>
      }
      {movie.videoURL && <span className="admin-video-badge">▶ Video</span>}
    </div>
    <div className="admin-movie-info">
      <h3>{movie.title}</h3>
      <div className="admin-movie-meta">
        <span className="admin-meta-chip">{movie.category}</span>
        <span className="admin-meta-chip">{movie.type === 'tv' ? 'TV Show' : 'Movie'}</span>
        {movie.imdbRating && <span className="admin-meta-chip">⭐ {movie.imdbRating}</span>}
      </div>
      <p className="admin-movie-desc">{movie.description?.slice(0, 100)}{movie.description?.length > 100 ? '…' : ''}</p>
      <div className="admin-movie-status">
        <span className={`admin-status-dot ${movie.thumbnailURL ? 'green' : 'red'}`} /> Thumbnail
        <span className={`admin-status-dot ${movie.videoURL ? 'green' : 'red'}`} style={{ marginLeft: '0.8rem' }} /> Video
      </div>
    </div>
    <div className="admin-movie-actions">
      <button className="admin-card-btn edit" onClick={() => onEdit(movie)} title="Edit details"><FiEdit2 /></button>
      <button className="admin-card-btn upload" onClick={() => onUploadMedia(movie)} title="Upload thumbnail / video"><FiUpload /></button>
      <button className="admin-card-btn delete" onClick={() => onDelete(movie)} title="Delete movie"><FiTrash2 /></button>
    </div>
  </div>
);

const BLANK_FORM = { title: '', description: '', imdbRating: '', category: 'Bollywood', type: 'movie' };

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  const [libLoading, setLibLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(BLANK_FORM);
  const [addFiles, setAddFiles] = useState({ thumbnail: null, video: null });
  const [addProgress, setAddProgress] = useState({ thumbnail: 0, video: 0 });
  const [addUploading, setAddUploading] = useState(false);
  const [addError, setAddError] = useState('');
  const [editMovie, setEditMovie] = useState(null);
  const [editForm, setEditForm] = useState(BLANK_FORM);
  const [editUploading, setEditUploading] = useState(false);
  const [editError, setEditError] = useState('');
  const [mediaMovie, setMediaMovie] = useState(null);
  const [mediaFiles, setMediaFiles] = useState({ thumbnail: null, video: null });
  const [mediaProgress, setMediaProgress] = useState({ thumbnail: 0, video: 0 });
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaError, setMediaError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setMovies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLibLoading(false);
    }, (err) => {
      console.error('Firestore error:', err);
      setLibLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!user) { setAddError('You must be signed in.'); return; }
    if (!addForm.title || !addForm.description) { setAddError('Title and description are required.'); return; }
    setAddUploading(true);
    try {
      let thumbnailURL = '';
      if (addFiles.thumbnail) {
        const res = await uploadMedia(addFiles.thumbnail, 'images', prog => setAddProgress(p => ({ ...p, thumbnail: prog })));
        thumbnailURL = res.url;
      }
      let videoURL = '';
      if (addFiles.video) {
        const res = await uploadMedia(addFiles.video, 'videos', prog => setAddProgress(p => ({ ...p, video: prog })));
        videoURL = res.url;
      }
      await addDoc(collection(db, 'movies'), {
        title: addForm.title, description: addForm.description,
        imdbRating: addForm.imdbRating, category: addForm.category,
        type: addForm.type, thumbnailURL, videoURL, createdAt: serverTimestamp()
      });
      setIsAddOpen(false);
      setAddForm(BLANK_FORM);
      setAddFiles({ thumbnail: null, video: null });
      setAddProgress({ thumbnail: 0, video: 0 });
    } catch (err) {
      setAddError(`Failed: ${err.message}`);
    } finally {
      setAddUploading(false);
    }
  };

  const openEdit = (movie) => {
    setEditMovie(movie);
    setEditForm({ title: movie.title, description: movie.description, imdbRating: movie.imdbRating || '', category: movie.category || 'Bollywood', type: movie.type || 'movie' });
    setEditError('');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editForm.title || !editForm.description) { setEditError('Title and description are required.'); return; }
    setEditUploading(true);
    try {
      await updateDoc(doc(db, 'movies', editMovie.id), {
        title: editForm.title, description: editForm.description,
        imdbRating: editForm.imdbRating, category: editForm.category, type: editForm.type
      });
      setEditMovie(null);
    } catch (err) {
      setEditError(`Failed: ${err.message}`);
    } finally {
      setEditUploading(false);
    }
  };

  const handleDelete = async (movie) => {
    if (!window.confirm(`Delete "${movie.title}"? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'movies', movie.id));
  };

  const openMediaUpload = (movie) => {
    setMediaMovie(movie);
    setMediaFiles({ thumbnail: null, video: null });
    setMediaProgress({ thumbnail: 0, video: 0 });
    setMediaError('');
  };

  const handleMediaUpload = async (e) => {
    e.preventDefault();
    setMediaError('');
    if (!mediaFiles.thumbnail && !mediaFiles.video) { setMediaError('Select at least one file.'); return; }
    setMediaUploading(true);
    try {
      const updates = {};
      if (mediaFiles.thumbnail) {
        const res = await uploadMedia(mediaFiles.thumbnail, 'images', prog => setMediaProgress(p => ({ ...p, thumbnail: prog })));
        updates.thumbnailURL = res.url;
      }
      if (mediaFiles.video) {
        const res = await uploadMedia(mediaFiles.video, 'videos', prog => setMediaProgress(p => ({ ...p, video: prog })));
        updates.videoURL = res.url;
      }
      await updateDoc(doc(db, 'movies', mediaMovie.id), updates);
      setMediaMovie(null);
    } catch (err) {
      setMediaError(`Failed: ${err.message}`);
    } finally {
      setMediaUploading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1 className="admin-title">Admin Dashboard</h1>

        <div className="admin-tabs">
          <button className={`admin-tab-btn ${activeTab === 'movies' ? 'active' : ''}`} onClick={() => setActiveTab('movies')}>Manage Movies</button>
          <button className={`admin-tab-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>User Chat</button>
        </div>

        {activeTab === 'movies' && (
          <div className="admin-content" style={{ maxWidth: '100%' }}>
            <div className="admin-header-actions">
              <h2>Movie Library <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, fontSize: '1rem' }}>({movies.length})</span></h2>
              <button className="admin-add-btn" onClick={() => { setIsAddOpen(true); setAddError(''); }}><FiPlus /> Add Movie</button>
            </div>
            {libLoading ? (
              <div className="admin-lib-loading">Loading movies…</div>
            ) : movies.length === 0 ? (
              <div className="admin-info-box"><p>No movies yet. Click "Add Movie" to get started.</p></div>
            ) : (
              <div className="admin-movie-grid">
                {movies.map(m => (
                  <MovieCard key={m.id} movie={m} onEdit={openEdit} onDelete={handleDelete} onUploadMedia={openMediaUpload} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && <AdminChat />}
      </div>

      {isAddOpen && (
        <div className="admin-modal-overlay" onClick={() => !addUploading && setIsAddOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setIsAddOpen(false)} disabled={addUploading}><FiX /></button>
            <h2 className="admin-modal-title">Add New Movie</h2>
            {addError && <div className="admin-error-box">{addError}</div>}
            <form onSubmit={handleAdd} className="admin-modal-form">
              <div className="form-group">
                <label>Movie Title *</label>
                <input type="text" value={addForm.title} onChange={e => setAddForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Inception" disabled={addUploading} />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={addForm.description} onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))} placeholder="Movie description..." rows="3" disabled={addUploading} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>IMDb Rating</label>
                  <input type="number" step="0.1" min="0" max="10" value={addForm.imdbRating} onChange={e => setAddForm(p => ({ ...p, imdbRating: e.target.value }))} placeholder="e.g. 8.5" disabled={addUploading} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <CustomSelect value={addForm.category} onChange={val => setAddForm(p => ({ ...p, category: val }))} options={[{ value: 'Bollywood', label: 'Bollywood' }, { value: 'Hollywood', label: 'Hollywood' }]} disabled={addUploading} />
                </div>
              </div>
              <div className="form-group">
                <label>Content Type</label>
                <CustomSelect value={addForm.type} onChange={val => setAddForm(p => ({ ...p, type: val }))} options={[{ value: 'movie', label: 'Movie' }, { value: 'tv', label: 'TV Show' }]} disabled={addUploading} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Thumbnail Image <span style={{ color: 'rgba(255,255,255,0.35)' }}>(optional)</span></label>
                  <CustomFileUpload id="add-thumbnail" accept="image/*" onChange={f => setAddFiles(p => ({ ...p, thumbnail: f }))} selectedFile={addFiles.thumbnail} labelText="Select Thumbnail" icon={FiImage} progress={addProgress.thumbnail} isUploading={addUploading} />
                </div>
                <div className="form-group">
                  <label>Movie Video <span style={{ color: 'rgba(255,255,255,0.35)' }}>(optional)</span></label>
                  <CustomFileUpload id="add-video" accept="video/*" onChange={f => setAddFiles(p => ({ ...p, video: f }))} selectedFile={addFiles.video} labelText="Select Video" icon={FiVideo} progress={addProgress.video} isUploading={addUploading} />
                </div>
              </div>
              <button type="submit" className="admin-submit-btn" disabled={addUploading}>
                {addUploading ? 'Uploading…' : 'Save Movie'}
              </button>
            </form>
          </div>
        </div>
      )}

      {editMovie && (
        <div className="admin-modal-overlay" onClick={() => !editUploading && setEditMovie(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setEditMovie(null)} disabled={editUploading}><FiX /></button>
            <h2 className="admin-modal-title">Edit Movie</h2>
            {editError && <div className="admin-error-box">{editError}</div>}
            <form onSubmit={handleEditSave} className="admin-modal-form">
              <div className="form-group">
                <label>Movie Title *</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} disabled={editUploading} />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows="3" disabled={editUploading} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>IMDb Rating</label>
                  <input type="number" step="0.1" min="0" max="10" value={editForm.imdbRating} onChange={e => setEditForm(p => ({ ...p, imdbRating: e.target.value }))} disabled={editUploading} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <CustomSelect value={editForm.category} onChange={val => setEditForm(p => ({ ...p, category: val }))} options={[{ value: 'Bollywood', label: 'Bollywood' }, { value: 'Hollywood', label: 'Hollywood' }]} disabled={editUploading} />
                </div>
              </div>
              <div className="form-group">
                <label>Content Type</label>
                <CustomSelect value={editForm.type} onChange={val => setEditForm(p => ({ ...p, type: val }))} options={[{ value: 'movie', label: 'Movie' }, { value: 'tv', label: 'TV Show' }]} disabled={editUploading} />
              </div>
              <button type="submit" className="admin-submit-btn" disabled={editUploading}>
                {editUploading ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {mediaMovie && (
        <div className="admin-modal-overlay" onClick={() => !mediaUploading && setMediaMovie(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setMediaMovie(null)} disabled={mediaUploading}><FiX /></button>
            <h2 className="admin-modal-title">Upload Media</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Uploading for: <strong style={{ color: '#fff' }}>{mediaMovie.title}</strong>
            </p>
            {mediaError && <div className="admin-error-box">{mediaError}</div>}
            <form onSubmit={handleMediaUpload} className="admin-modal-form">
              <div className="form-group">
                <label>New Thumbnail Image</label>
                {mediaMovie.thumbnailURL && <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 0.4rem' }}>Current thumbnail will be replaced.</p>}
                <CustomFileUpload id="media-thumbnail" accept="image/*" onChange={f => setMediaFiles(p => ({ ...p, thumbnail: f }))} selectedFile={mediaFiles.thumbnail} labelText="Select Thumbnail" icon={FiImage} progress={mediaProgress.thumbnail} isUploading={mediaUploading} />
              </div>
              <div className="form-group">
                <label>New Movie Video</label>
                {mediaMovie.videoURL && <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 0.4rem' }}>Current video will be replaced.</p>}
                <CustomFileUpload id="media-video" accept="video/*" onChange={f => setMediaFiles(p => ({ ...p, video: f }))} selectedFile={mediaFiles.video} labelText="Select Video" icon={FiVideo} progress={mediaProgress.video} isUploading={mediaUploading} />
              </div>
              <button type="submit" className="admin-submit-btn" disabled={mediaUploading}>
                {mediaUploading ? 'Uploading…' : 'Upload Files'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
