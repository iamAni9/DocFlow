import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Heading1, Heading2, Share2, Save, ArrowLeft, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const titleRef = useRef(title);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const autoSaveEnabledRef = useRef(autoSaveEnabled);

  useEffect(() => {
    autoSaveEnabledRef.current = autoSaveEnabled;
  }, [autoSaveEnabled]);

  const [shareUsername, setShareUsername] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(true); 
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (showShareModal) {
      api.get('/users').then(res => setUsers(res.data)).catch(console.error);
    } else {
      setShareUsername('');
      setIsDropdownOpen(false);
    }
  }, [showShareModal]); 

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: '',
    onUpdate: ({ editor }) => {
      if (!id || !autoSaveEnabledRef.current) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        api.put(`/documents/${id}`, { title: titleRef.current, content: editor.getHTML() }).catch(console.error);
      }, 1000);
    }
  });

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!id || !editor || !autoSaveEnabledRef.current) return;
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      api.put(`/documents/${id}`, { title: newTitle, content: editor.getHTML() }).catch(console.error);
    }, 1000);
  };

  useEffect(() => {
    if (id && editor) {
      api.get(`/documents/${id}`).then(res => {
        setTitle(res.data.title);
        editor.commands.setContent(res.data.content);
        setIsOwner(res.data.ownerId === localStorage.getItem('userId'));
      }).catch(err => {
        console.error(err);
        showToast('Failed to load document', 'error');
        navigate('/');
      });
    }
  }, [id, editor]);

  const handleSave = async () => {
    if (!editor) return;
    setIsSaving(true);
    const content = editor.getHTML();
    try {
      if (id) {
        await api.put(`/documents/${id}`, { title, content });
        showToast('Saved successfully!', 'success');
      } else {
        const res = await api.post('/documents', { title, content });
        navigate(`/doc/${res.data.id}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Save failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!id) return showToast('Save document first before sharing', 'info');
    try {
      await api.post(`/documents/${id}/share`, { username: shareUsername });
      showToast(`Shared with ${shareUsername}!`, 'success');
      setShowShareModal(false);
      setShareUsername('');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to share', 'error');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const isConfirmed = await confirm({
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document? This action cannot be undone.',
      confirmText: 'Delete',
      danger: true
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/documents/${id}`);
      navigate('/');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete document', 'error');
    }
  };

  if (!editor) return null;

  return (
    <div className="editor-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 64 }}>
        <button className="btn-ghost" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back
        </button>
        
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button 
            className="btn-ghost" 
            style={{ display: 'flex', gap: 6, alignItems: 'center' }} 
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            title="Toggle Auto-save"
          >
            {autoSaveEnabled ? <ToggleRight size={18} color="var(--primary)" /> : <ToggleLeft size={18} />}
            Auto-save
          </button>
          <button className="btn btn-secondary" onClick={handleSave} disabled={isSaving}>
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
          </button>
          {id && isOwner && (
            <>
              <button className="btn btn-secondary" onClick={() => setShowShareModal(true)}>
                <Share2 size={16} /> Share
              </button>
              <button className="btn" style={{ backgroundColor: 'var(--error)' }} onClick={handleDelete}>
                <Trash2 size={16} /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      <input 
        value={title} 
        onChange={handleTitleChange} 
        placeholder="Untitled" 
        className="title-input"
      />

      {showShareModal && (
        <div className="card" style={{ marginBottom: 32, display: 'flex', gap: 12, alignItems: 'center', backgroundColor: 'var(--surface-soft)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              className="input" 
              placeholder="Search user by name..."
              value={shareUsername}
              onChange={e => {
                setShareUsername(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            />
            {isDropdownOpen && shareUsername && (
              <div className="card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, padding: 8, zIndex: 100, boxShadow: 'var(--shadow-2)' }}>
                {users
                  .filter(u => u.id !== localStorage.getItem('userId') && u.username.toLowerCase().includes(shareUsername.toLowerCase()))
                  .map(u => (
                    <div 
                      key={u.id}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: 'var(--rounded-sm)' }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setShareUsername(u.username);
                        setIsDropdownOpen(false);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {u.username}
                    </div>
                  ))}
                  {users.filter(u => u.id !== localStorage.getItem('userId') && u.username.toLowerCase().includes(shareUsername.toLowerCase())).length === 0 && (
                    <div style={{ padding: '8px 12px', color: 'var(--steel)', fontSize: '14px' }}>No users found.</div>
                  )}
              </div>
            )}
          </div>
          <button className="btn" onClick={handleShare} disabled={!shareUsername}>Share</button>
          <button className="btn btn-secondary" onClick={() => setShowShareModal(false)}>Cancel</button>
        </div>
      )}

      <div className="editor-toolbar">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`btn-ghost ${editor.isActive('bold') ? 'active' : ''}`}>
          <Bold size={18} />
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`btn-ghost ${editor.isActive('italic') ? 'active' : ''}`}>
          <Italic size={18} />
        </button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`btn-ghost ${editor.isActive('underline') ? 'active' : ''}`}>
          <UnderlineIcon size={18} />
        </button>
        <div style={{ width: 1, backgroundColor: 'var(--hairline)', margin: '0 8px' }}></div>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`btn-ghost ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}>
          <Heading1 size={18} />
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`btn-ghost ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}>
          <Heading2 size={18} />
        </button>
        <div style={{ width: 1, backgroundColor: 'var(--hairline)', margin: '0 8px' }}></div>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`btn-ghost ${editor.isActive('bulletList') ? 'active' : ''}`}>
          <List size={18} />
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`btn-ghost ${editor.isActive('orderedList') ? 'active' : ''}`}>
          <ListOrdered size={18} />
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
