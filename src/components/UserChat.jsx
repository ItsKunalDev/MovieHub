import { useState, useEffect, useRef } from 'react';
import { FiX, FiSend, FiMessageCircle, FiShield, FiTrash2 } from 'react-icons/fi';
import {
  collection, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, doc, setDoc, deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './UserChat.css';

export default function UserChat({ isOpen, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const messagesEndRef = useRef(null);

  const conversationId = user?.uid;

  useEffect(() => {
    if (!isOpen || !conversationId) return;

    const convoRef = doc(db, 'conversations', conversationId);
    setDoc(convoRef, {
      userId: conversationId,
      userName: user.displayName || user.name || 'User',
      userEmail: user.email || '',
      lastSeen: serverTimestamp(),
    }, { merge: true });

    const msgsRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (err) => {
      console.error('Chat error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, conversationId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user || !conversationId) return;
    const text = input.trim();
    setInput('');
    try {
      const msgsRef = collection(db, 'conversations', conversationId, 'messages');
      await addDoc(msgsRef, {
        text,
        senderId: user.uid,
        sender: user.displayName || user.name || 'User',
        isAdmin: false,
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'conversations', conversationId), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        lastMessageBy: 'user',
        unreadByAdmin: true,
      }, { merge: true });
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const deleteMessage = async (msgId) => {
    if (!conversationId) return;
    try {
      await deleteDoc(doc(db, 'conversations', conversationId, 'messages', msgId));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="user-chat-popup">
      <div className="user-chat-header">
        <div className="user-chat-title">
          <FiMessageCircle /> Chat with Admin
        </div>
        <button className="user-chat-close" onClick={onClose}><FiX /></button>
      </div>

      <div className="user-chat-messages">
        {!user ? (
          <p className="chat-status">Please sign in to chat.</p>
        ) : loading ? (
          <p className="chat-status">Loading…</p>
        ) : messages.length === 0 ? (
          <div className="chat-empty-state">
            <FiShield className="chat-empty-icon" />
            <p>No messages yet.</p>
            <span>Send a message to start chatting with the admin!</span>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${msg.isAdmin ? 'admin-msg' : 'my-msg'}`}
              onMouseEnter={() => setHoveredMsg(msg.id)}
              onMouseLeave={() => setHoveredMsg(null)}
            >
              {msg.isAdmin && <span className="chat-sender-label admin-label">Admin</span>}
              <div className="chat-bubble-row">
                <div className="chat-bubble"><p>{msg.text}</p></div>
                {!msg.isAdmin && hoveredMsg === msg.id && (
                  <button
                    className="chat-delete-btn"
                    onClick={() => deleteMessage(msg.id)}
                    title="Delete message"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
              {!msg.isAdmin && <span className="chat-sender-label user-label">You</span>}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {user && (
        <form className="user-chat-input" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" disabled={!input.trim()}><FiSend /></button>
        </form>
      )}
    </div>
  );
}
