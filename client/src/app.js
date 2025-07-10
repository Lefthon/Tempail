import React, { useState, useEffect } from 'react';
import '/app.css';

function App() {
  const [email, setEmail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createNewEmail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/email/create', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setEmail(data);
        localStorage.setItem('tempEmail', JSON.stringify(data));
      } else {
        setError(data.result.error);
      }
    } catch (err) {
      setError('Failed to create email');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/email/messages/${email.emailToken}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      } else {
        setError(data.result.error);
      }
    } catch (err) {
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessage = async (messageId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/email/message/${messageId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedMessage(data.message);
      } else {
        setError(data.result.error);
      }
    } catch (err) {
      setError('Failed to fetch message');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('tempEmail');
    if (savedEmail) {
      setEmail(JSON.parse(savedEmail));
    }
  }, []);

  useEffect(() => {
    if (email) {
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [email]);

  return (
    <div className="container">
      <header>
        <h1>TempMail Service</h1>
        <p>Disposable temporary email addresses</p>
      </header>

      <main>
        {!email ? (
          <div className="email-create">
            <button onClick={createNewEmail} disabled={loading}>
              {loading ? 'Creating...' : 'Create Temporary Email'}
            </button>
            {error && <p className="error">{error}</p>}
          </div>
        ) : (
          <div className="email-dashboard">
            <div className="email-info">
              <h2>Your Temporary Email:</h2>
              <div className="email-address">{email.email}</div>
              <p>Expires: {new Date(email.deletedIn).toLocaleString()}</p>
              <button onClick={createNewEmail}>Create New Email</button>
            </div>

            <div className="email-messages">
              <h3>Inbox ({messages.length})</h3>
              <button onClick={fetchMessages} disabled={loading}>
                Refresh
              </button>
              
              {messages.length === 0 ? (
                <p>No messages yet</p>
              ) : (
                <ul>
                  {messages.map((msg) => (
                    <li key={msg.id} onClick={() => fetchMessage(msg.id)}>
                      <strong>{msg.from}</strong>: {msg.subject}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedMessage && (
              <div className="email-viewer">
                <h3>{selectedMessage.subject}</h3>
                <p>From: {selectedMessage.from} &lt;{selectedMessage.fromEmail}&gt;</p>
                <p>Received: {new Date(selectedMessage.receivedAt).toLocaleString()}</p>
                <div dangerouslySetInnerHTML={{ __html: selectedMessage.content }} />
              </div>
            )}
          </div>
        )}
      </main>

      <footer>
        <p>TempMail Service &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
