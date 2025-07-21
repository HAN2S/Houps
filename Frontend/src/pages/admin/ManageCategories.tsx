import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Buffer } from 'buffer';
import '../styles/AdminPanel.css';
import '../styles/Buttons.css';

interface Category {
    id: number;
    nameFr: string;
    nameEn: string;
    nameAr: string;
}

Modal.setAppElement('#root');

const ManageCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState({ nameFr: '', nameEn: '', nameAr: '' });
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    const getAuthHeaders = (): Record<string, string> => {
        const user = localStorage.getItem('adminUser');
        const pass = localStorage.getItem('adminPass');
        if (user && pass) {
            return {
                'Authorization': 'Basic ' + Buffer.from(user + ":" + pass).toString('base64')
            };
        }
        return {};
    };

    useEffect(() => {
        fetch('http://localhost:8081/api/admin/categories', { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error("Failed to fetch categories", err));
    }, []);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        fetch('http://localhost:8081/api/admin/categories', {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(newCategory)
        })
        .then(res => res.json())
        .then(created => {
            setCategories([...categories, created]);
            setNewCategory({ nameFr: '', nameEn: '', nameAr: '' });
            setCreateModalOpen(false);
        })
        .catch(err => console.error("Failed to create category", err));
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            fetch(`http://localhost:8081/api/admin/categories/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })
            .then(async res => {
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    const msg = 'Failed to delete category with associated questions';
                    alert(msg);
                    throw new Error(msg);
                }
                setCategories(categories.filter(c => c.id !== id));
            })
            .catch(err => console.error("Failed to delete category", err));
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        fetch(`http://localhost:8081/api/admin/categories/${editingCategory.id}`, {
            method: 'PUT',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(editingCategory)
        })
        .then(res => res.json())
        .then(updated => {
            setCategories(categories.map(c => c.id === updated.id ? updated : c));
            setEditModalOpen(false);
            setEditingCategory(null);
        })
        .catch(err => console.error("Failed to update category", err));
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setEditModalOpen(true);
    };

    // Sort categories alphabetically by English name
    const sortedCategories = [...categories].sort((a, b) => a.nameEn.localeCompare(b.nameEn));

    return (
        <div className="admin-card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h1>Manage Categories</h1>
                <button className="admin-btn" onClick={() => setCreateModalOpen(true)}>Add Category</button>
            </div>

            <Modal isOpen={isCreateModalOpen} onRequestClose={() => setCreateModalOpen(false)}
                className="admin-modal-card"
                overlayClassName="admin-modal-overlay">
                <h2>Create New Category</h2>
                <form onSubmit={handleCreate} className="admin-form">
                    <input type="text" placeholder="French Name" value={newCategory.nameFr} onChange={(e) => setNewCategory({ ...newCategory, nameFr: e.target.value })} />
                    <input type="text" placeholder="English Name" value={newCategory.nameEn} onChange={(e) => setNewCategory({ ...newCategory, nameEn: e.target.value })} />
                    <input type="text" placeholder="Arabic Name" value={newCategory.nameAr} onChange={(e) => setNewCategory({ ...newCategory, nameAr: e.target.value })} />
                    <button type="submit" className="admin-btn">Create</button>
                    <button type="button" className="admin-btn-secondary" onClick={() => setCreateModalOpen(false)}>Cancel</button>
                </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onRequestClose={() => setEditModalOpen(false)}
                className="admin-modal-card"
                overlayClassName="admin-modal-overlay">
                <h2>Edit Category</h2>
                {editingCategory && (
                     <form onSubmit={handleUpdate} className="admin-form">
                        <input type="text" placeholder="French Name" value={editingCategory.nameFr} onChange={(e) => setEditingCategory({ ...editingCategory, nameFr: e.target.value })} />
                        <input type="text" placeholder="English Name" value={editingCategory.nameEn} onChange={(e) => setEditingCategory({ ...editingCategory, nameEn: e.target.value })} />
                        <input type="text" placeholder="Arabic Name" value={editingCategory.nameAr} onChange={(e) => setEditingCategory({ ...editingCategory, nameAr: e.target.value })} />
                        <button type="submit" className="admin-btn">Update</button>
                        <button type="button" className="admin-btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                    </form>
                )}
            </Modal>
            
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>French Name</th>
                        <th>English Name</th>
                        <th>Arabic Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedCategories.map(cat => (
                        <tr key={cat.id}>
                            <td>{cat.id}</td>
                            <td>{cat.nameFr}</td>
                            <td>{cat.nameEn}</td>
                            <td>{cat.nameAr}</td>
                            <td>
                                <button className="admin-action-btn edit" title="Edit" onClick={() => openEditModal(cat)}>
                                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M15.41 2.59a2 2 0 0 1 2.83 2.83l-1.09 1.09-2.83-2.83 1.09-1.09zm-2.12 2.12l2.83 2.83-8.59 8.59H4.7v-2.83l8.59-8.59z"/></svg>
                                </button>
                                <button className="admin-action-btn delete" title="Delete" onClick={() => handleDelete(cat.id)}>
                                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M6 8v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8m-9 0h10m-7-3V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageCategories; 