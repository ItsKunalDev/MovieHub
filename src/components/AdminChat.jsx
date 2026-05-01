import { useState, useEffect, useRef } from 'react';
import { FiSend, FiUser, FiMessageCircle, FiCircle, FiTrash2 } from 'react-icons/fi';
import {
  collection, query, orderBy, onSnapshot,
  serverTimestamp, doc, setDoc, addDoc, deleteDoc, writeBatch, getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './AdminChat.css';

export default function AdminChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'conversations'), orderBy('lastMessageAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingConvos(false);
    }, (err) => {
      console.error('Conversation list error:', err);
      setLoadingConvos(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedConvo) { setMessages([]); return; }
    setLoadingMsgs(true);
    const msgsRef = collection(db, 'conversations', selectedConvo.id, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingMsgs(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    setDoc(doc(db, 'conversations', selectedConvo.id), { unreadByAdmin: false }, { merge: true });
    return () => unsub();
  }, [selectedConvo]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedConvo) return;
    const text = input.trim();
    setInput('');
    try {
      const msgsRef = collection(db, 'conversations', selectedConvo.id, 'messages');
      await addDoc(msgsRef, {
        text,
        senderId: user?.uid || 'admin',
        sender: 'Admin',
        isAdmin: true,
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'conversations', selectedConvo.id), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        lastMessageBy: 'admin',
        unreadByAdmin: false,
      }, { merge: true });
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const deleteMessage = async (msgId) => {
    if (!selectedConvo) return;
    try {
      await deleteDoc(doc(db, 'conversations', selectedConvo.id, 'messages', msgId));
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  const deleteConversation = async (convo) => {
    if (!window.confirm(`Delete entire conversation with ${convo.userName || 'this user'}? This cannot be undone.`)) return;
    try {
      const msgsRef = collection(db, 'conversations', convo.id, 'messages');
      const snap = await getDocs(msgsRef);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      batch.delete(doc(db, 'conversations', convo.id));
      await batch.commit();
      if (selectedConvo?.id === convo.id) setSelectedConvo(null);
    } catch (err) {
      console.error('Delete conversation error:', err);
    }
  };

  const formatTime = (ts) => {
    if (!ts?.toDate) return '';
    return ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="admin-chat-root">
      <div className="admin-chat-sidebar">
        <div className="admin-chat-sidebar-header">
          <FiMessageCircle />
          <span>User Conversations</span>
          {conversations.filter(c => c.unreadByAdmin).length > 0 && (
            <span className="admin-chat-unread-badge">
              {conversations.filter(c => c.unreadByAdmin).length}
            </span>
          )}
        </div>

        <div className="admin-chat-convo-list">
          {loadingConvos ? (
            <p className="admin-chat-status">Loading…</p>
          ) : conversations.length === 0 ? (
            <p className="admin-chat-status">No user conversations yet.</p>
          ) : (
            conversations.map((convo) => (
              <div
                key={convo.id}
                className={`admin-chat-convo-item ${selectedConvo?.id === convo.id ? 'active' : ''}`}
                onClick={() => setSelectedConvo(convo)}
              >
                <div className="admin-convo-avatar">
                  {convo.userName?.[0]?.toUpperCase() || <FiUser />}
                </div>
                <div className="admin-convo-info">
                  <span className="admin-convo-name">{convo.userName || 'User'}</span>
                  <span className="admin-convo-preview">{convo.lastMessage || 'No messages yet'}</span>
                </div>
                <div className="admin-convo-right">
                  {convo.unreadByAdmin && <FiCircle className="admin-convo-unread-dot" />}
                  <button
                    className="admin-convo-delete-btn"
                    onClick={(e) => { e.stopPropagation(); deleteConversation(convo); }}
                    title="Delete conversation"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="admin-chat-main">
        {!selectedConvo ? (
          <div className="admin-chat-no-selection">
            <FiMessageCircle className="admin-chat-no-sel-icon" />
            <p>Select a conversation</p>
            <span>Choose a user from the left to start replying.</span>
          </div>
        ) : (
          <>
            <div className="admin-chat-main-header">
              <div className="admin-chat-main-avatar">
                {selectedConvo.userName?.[0]?.toUpperCase() || <FiUser />}
              </div>
              <div>
                <p className="admin-chat-main-name">{selectedConvo.userName || 'User'}</p>
                <p className="admin-chat-main-email">{selectedConvo.userEmail || ''}</p>
              </div>
            </div>

            <div className="admin-chat-messages-area">
              {loadingMsgs ? (
                <p className="admin-chat-status">Loading messages…</p>
              ) : messages.length === 0 ? (
                <p className="admin-chat-status">No messages in this conversation yet.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`admin-chat-msg-wrap ${msg.isAdmin ? 'is-admin' : 'is-user'}`}
                    onMouseEnter={() => setHoveredMsg(msg.id)}
                    onMouseLeave={() => setHoveredMsg(null)}
                  >
                    {!msg.isAdmin && (
                      <div className="admin-chat-msg-avatar">
                        {selectedConvo.userName?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="admin-chat-msg-block">
                      <span className="admin-chat-msg-name">
                        {msg.isAdmin ? 'Admin (You)' : selectedConvo.userName}
                      </span>
                      <div className="admin-chat-bubble-row">
                        {msg.isAdmin && hoveredMsg === msg.id && (
                          <button className="admin-msg-delete-btn" onClick={() => deleteMessage(msg.id)} title="Delete message">
                            <FiTrash2 />
                          </button>
                        )}
                        <div className="admin-chat-bubble">{msg.text}</div>
                        {!msg.isAdmin && hoveredMsg === msg.id && (
                          <button className="admin-msg-delete-btn" onClick={() => deleteMessage(msg.id)} title="Delete message">
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                      <span className="admin-chat-time">{formatTime(msg.createdAt)}</span>
                    </div>
                    {msg.isAdmin && (
                      <div className="admin-chat-msg-avatar admin-avatar-icon">A</div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="admin-chat-reply-form" onSubmit={sendMessage}>
              <input
                type="text"
                placeholder={`Reply to ${selectedConvo.userName || 'user'}…`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
              />
              <button type="submit" disabled={!input.trim()}><FiSend /></button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
