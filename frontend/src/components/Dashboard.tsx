import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, FileText, Plus } from 'lucide-react';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

const Dashboard = () => {
  const [ownedDocs, setOwnedDocs] = useState<any[]>([]);
  const [sharedDocs, setSharedDocs] = useState<any[]>([]);
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const fetchDocs = async () => {
    try {
      const res = await api.get('/documents');
      setOwnedDocs(res.data.ownedDocs);
      setSharedDocs(res.data.sharedDocs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await api.post('/upload', formData);
      const { title, content } = uploadRes.data;
      
      const docRes = await api.post('/documents', { title, content });
      navigate(`/doc/${docRes.data.id}`);
    } catch (err) {
      console.error(err);
      showToast('Upload failed', 'error');
    }
  };

  const handleCreate = async () => {
    try {
      const docRes = await api.post('/documents', { title: 'Untitled Document', content: '<p></p>' });
      navigate(`/doc/${docRes.data.id}`);
    } catch (err) {
      console.error(err);
      showToast('Failed to create document', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document? This action cannot be undone.',
      confirmText: 'Delete',
      danger: true
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocs();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete document', 'error');
    }
  };

  const cardTints = ['card-peach', 'card-rose', 'card-mint', 'card-sky', 'card-lavender'];

  const renderDocList = (docs: any[], title: string) => (
    <div style={{ marginBottom: 48 }}>
      <h3 style={{ marginBottom: 20, color: 'var(--ink)' }}>{title}</h3>
      {docs.length === 0 ? <p style={{ color: 'var(--steel)', fontSize: '14px' }}>No documents found.</p> : (
        <div className="grid grid-cols-3">
          {docs.map((doc, index) => {
            const tint = cardTints[index % cardTints.length];
            return (
              <Link to={`/doc/${doc.id}`} key={doc.id} style={{ textDecoration: 'none' }}>
                <div className={`card ${tint}`} style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <FileText size={24} color="var(--charcoal)" style={{ opacity: 0.5 }} />
                  </div>
                  <h4 style={{ color: 'var(--ink)', fontSize: '18px', fontWeight: 600, marginBottom: 8, paddingRight: 24, lineHeight: 1.4 }}>
                    {doc.title || 'Untitled Document'}
                  </h4>
                  <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <p style={{ fontSize: '13px', color: 'var(--charcoal)', opacity: 0.7, fontWeight: 500 }}>
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </p>
                    {title === 'My Documents' && (
                      <button 
                        onClick={(e) => { e.preventDefault(); handleDelete(doc.id); }}
                        className="btn-ghost"
                        style={{ padding: '6px', color: 'var(--error)', backgroundColor: 'transparent' }}
                        title="Delete Document"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 64 }}>
        <h2 className="display-lg">Documents</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => fileInput.current?.click()}>Upload File</button>
          <input type="file" ref={fileInput} style={{ display: 'none' }} accept=".txt,.md,.docx" onChange={handleUpload} />
          <button onClick={handleCreate} className="btn">
            <Plus size={16} /> New Document
          </button>
        </div>
      </div>

      {renderDocList(ownedDocs, 'My Documents')}
      {renderDocList(sharedDocs, 'Shared with Me')}
    </div>
  );
};

export default Dashboard;
