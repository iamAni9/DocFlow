import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

interface User { id: string; username: string; }

const Login = ({ onLogin }: { onLogin: (id: string, username: string) => void }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const fetchUsers = () => {
    api.get('/users').then(res => setUsers(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    try {
      const res = await api.post('/users', { username: newUsername.trim() });
      onLogin(res.data.id, res.data.username);
    } catch (err) {
      console.error(err);
      showToast('Failed to create/login user', 'error');
    }
  };

  const handleDeleteUser = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isConfirmed = await confirm({
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This will permanently delete all their documents as well.',
      confirmText: 'Delete',
      danger: true
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete user', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--surface-soft)' }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', margin: '0 20px', padding: '40px 32px' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo.svg" alt="DocFlow Logo" style={{ width: 64, height: 64, marginBottom: 16 }} />
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 8 }}>Welcome to DocFlow</h2>
          <p style={{ color: 'var(--steel)', fontSize: '15px' }}>Sign in or create a dummy account to continue</p>
        </div>

        {users.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Existing Users</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {users.map(u => (
                <div key={u.id} style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'flex-start', padding: '10px 16px', fontWeight: 500 }} onClick={() => onLogin(u.id, u.username)}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--surface)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, fontSize: '12px', color: 'var(--charcoal)' }}>
                      {u.username.charAt(0).toUpperCase()}
                    </span>
                    {u.username}
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0 12px', border: 'none' }}
                    onClick={(e) => handleDeleteUser(u.id, e)}
                    title="Delete User"
                  >
                    <Trash2 size={16} color="var(--stone)" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {users.length > 0 && (
          <div style={{ height: 1, backgroundColor: 'var(--hairline)', margin: '24px 0' }} />
        )}

        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Create New Account</h3>
          <form onSubmit={handleCreateLogin} style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              placeholder="Enter username"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn">Continue</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
