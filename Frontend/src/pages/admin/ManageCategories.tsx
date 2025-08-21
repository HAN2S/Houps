import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Buffer } from 'buffer';
import { FaEdit, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
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
    const [isModalOpen, setModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    const validateCategory = (category: { nameFr: string; nameEn: string; nameAr: string }): string | null => {
        const fields = [
            { name: 'nameFr', value: category.nameFr },
            { name: 'nameEn', value: category.nameEn },
            { name: 'nameAr', value: category.nameAr },
        ];
        const emptyFields = fields.filter(field => !field.value || field.value.trim() === '');
        if (emptyFields.length > 0) {
            return `Please fill all fields: ${emptyFields.map(f => f.name).join(', ')}.`;
        }
        return null;
    };

    const prepareCategoryPayload = (category: { id?: number; nameFr: string; nameEn: string; nameAr: string }): any => ({
        id: category.id,
        nameFr: category.nameFr,
        nameEn: category.nameEn,
        nameAr: category.nameAr,
    });

    const performCategoryAction = (method: string, url: string, payload: any, onSuccess: (data: any) => void) => {
        fetch(url, {
            method,
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(res => {
                if (!res.ok) throw new Error(`Failed to ${method.toLowerCase()} category`);
                return res.json();
            })
            .then(data => {
                onSuccess(data);
            })
            .catch(err => console.error(err.message));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const categoryToValidate = editingCategory || newCategory;
        const error = validateCategory(categoryToValidate);
        if (error) {
            setErrorMessage(error);
            return;
        }
        const payload = prepareCategoryPayload(editingCategory || newCategory);
        const method = editingCategory ? 'PUT' : 'POST';
        const url = editingCategory
            ? `http://localhost:8081/api/admin/categories/${editingCategory.id}`
            : 'http://localhost:8081/api/admin/categories';
        performCategoryAction(method, url, payload, (data) => {
            if (editingCategory) {
                setCategories(categories.map(c => c.id === data.id ? data : c));
                setEditingCategory(null);
            } else {
                setCategories([...categories, data]);
                setNewCategory({ nameFr: '', nameEn: '', nameAr: '' });
            }
            setModalOpen(false);
            setErrorMessage(null);
        });
    };


    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            fetch(`http://localhost:8081/api/admin/categories/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
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

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
        } else {
            setNewCategory({ nameFr: '', nameEn: '', nameAr: '' });
            setEditingCategory(null);
        }
        setModalOpen(true);
    };
    const sortedCategories = [...categories].sort((a, b) => a.nameEn.localeCompare(b.nameEn));

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1>Manage Categories</h1>
                <button
                    className="admin-icon-btn"
                    onClick={() => openModal()}
                    title="Add Category"
                    aria-label="Add Category"
                >
                    <FaPlus />
                </button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => { setModalOpen(false); setErrorMessage(null); setEditingCategory(null); }}
                className="question-modal"
                overlayClassName="upload-modal-overlay"
            >
                <div className="question-modal-content">
                    <button
                        className="upload-close-btn"
                        onClick={() => { setModalOpen(false); setErrorMessage(null); setEditingCategory(null); }}
                        title="Close"
                        aria-label="Close"
                    >
                        <FaTimes size={18} color="#328e6e" />
                    </button>
                    <h2>{editingCategory ? 'Edit Category' : 'Import Category'}</h2>
                    {errorMessage && <div className="error-message" style={{ color: '#e74c3c', marginTop: '0.5rem' }}>{errorMessage}</div>}
                        <form onSubmit={handleSave} className="question-form">

                            <div className="form-section">
                                <label>French Name</label>
                                <input
                                    type="text"
                                    value={editingCategory?.nameFr || newCategory.nameFr}
                                    onChange={(e) => {
                                        if (editingCategory) {
                                            setEditingCategory({ ...editingCategory, nameFr: e.target.value });
                                        } else {
                                            setNewCategory({ ...newCategory, nameFr: e.target.value });
                                        }
                                    }}
                                    placeholder="French Name"
                                    required
                                />
                            </div>
                            <div className="form-section">
                                <label>English Name</label>
                                <input
                                    type="text"
                                    value={editingCategory?.nameEn || newCategory.nameEn}
                                    onChange={(e) => {
                                        if (editingCategory) {
                                            setEditingCategory({ ...editingCategory, nameEn: e.target.value });
                                        } else {
                                            setNewCategory({ ...newCategory, nameEn: e.target.value });
                                        }
                                    }}
                                    placeholder="English Name"
                                    required
                                />
                            </div>
                            <div className="form-section">
                                <label>Arabic Name</label>
                                <input
                                    type="text"
                                    value={editingCategory?.nameAr || newCategory.nameAr}
                                    onChange={(e) => {
                                        if (editingCategory) {
                                            setEditingCategory({ ...editingCategory, nameAr: e.target.value });
                                        } else {
                                            setNewCategory({ ...newCategory, nameAr: e.target.value });
                                        }
                                    }}
                                    placeholder="Arabic Name"
                                    required
                                />
                            </div>
                            <div className="form-actions" style={{ position: 'sticky', bottom: 0, background: '#fff', padding: '1rem', borderTop: '1px solid #b6e2c6', marginTop: 'auto' }}>
                                <button type="button" className="admin-btn-secondary" onClick={() => { setModalOpen(false); setErrorMessage(null); setEditingCategory(null); }}>Cancel</button>
                                <button type="submit" className="admin-btn">{editingCategory ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                </div>
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
                                <button
                                    className="admin-action-btn edit"
                                    title="Edit"
                                    onClick={() => openModal(cat)}
                                >
                                    <FaEdit size={18} color="#328e6e" />
                                </button>
                                <button
                                    className="admin-action-btn delete"
                                    title="Delete"
                                    onClick={() => handleDelete(cat.id)}
                                >
                                    <FaTrash size={18} color="#c0392b" />
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