import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import { Buffer } from 'buffer';
import '../styles/AdminPanel.css';
import { FaFilter, FaPlus, FaUpload, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

// Interfaces to match backend models
interface Category {
    id: number;
    nameFr: string;
    nameEn: string;
    nameAr: string;
}

interface FallbackOption {
    fallbackFr: string;
    fallbackEn: string;
    fallbackAr: string;
}

interface Question {
    id: number;
    category: Category;
    difficulty: number;
    questionTextFr: string;
    questionTextEn: string;
    questionTextAr: string;
    correctAnswerFr: string;
    correctAnswerEn: string;
    correctAnswerAr: string;
    trapAnswerFr: string;
    trapAnswerEn: string;
    trapAnswerAr: string;
    fallbackOptions: FallbackOption[];
}
const initialQuestionState: Partial<Question> = {
    difficulty: 1,
    questionTextFr: '', questionTextEn: '', questionTextAr: '',
    correctAnswerFr: '', correctAnswerEn: '', correctAnswerAr: '',
    trapAnswerFr: '', trapAnswerEn: '', trapAnswerAr: '',
    fallbackOptions: [{ fallbackFr: '', fallbackEn: '', fallbackAr: '' }, { fallbackFr: '', fallbackEn: '', fallbackAr: '' }, { fallbackFr: '', fallbackEn: '', fallbackAr: '' }]
};


Modal.setAppElement('#root');

const ManageQuestions = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);

    // Pagination and Filter State
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filterCategory, setFilterCategory] = useState('');

    // Filter state for each column
    const [filters, setFilters] = useState({
        id: '',
        category: '',
        difficulty: '',
        questionTextEn: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // Helper to display difficulty as text
    const difficultyLabel = (d: number | string) => {
        if (d === 1 || d === '1') return 'Easy';
        if (d === 2 || d === '2') return 'Medium';
        if (d === 3 || d === '3') return 'Hard';
        return d;
    };

    const getAuthHeaders = (): Record<string, string> => {
        const user = localStorage.getItem('adminUser');
        const pass = localStorage.getItem('adminPass');
        return user && pass ? { 'Authorization': 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64') } : {};
    };
    
    const fetchQuestions = useCallback(() => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: '10',
            sort: 'id,desc'
        });
        if (filters.id) params.append('id', filters.id);
        if (filters.category) {
            const cat = categories.find(c => c.nameEn === filters.category);
            if (cat) params.append('categoryId', String(cat.id));
        }
        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.questionTextEn) params.append('questionTextEn', filters.questionTextEn);

        fetch(`http://localhost:8081/api/admin/questions?${params.toString()}`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                setQuestions(data.content);
                setTotalPages(data.totalPages);
            })
            .catch(err => console.error("Failed to fetch questions", err));
    }, [page, filters, categories]);

    // Reset to page 0 when filters change
    useEffect(() => {
        setPage(0);
    }, [filters]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions, page]);

    useEffect(() => {
        // Fetch categories for the dropdown
        fetch('http://localhost:8081/api/admin/categories', { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error("Failed to fetch categories", err));
    }, []);

    const openModal = (question: Partial<Question> | null) => {
        setEditingQuestion(question ? { ...question } : { ...initialQuestionState });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingQuestion(null);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingQuestion) return;

        const method = editingQuestion.id ? 'PUT' : 'POST';
        const url = editingQuestion.id ? `http://localhost:8081/api/admin/questions/${editingQuestion.id}` : 'http://localhost:8081/api/admin/questions';
        
        // Ensure category is an object with an ID for the backend
        const payload = {
            ...editingQuestion,
            category: { id: editingQuestion.category?.id }
        };

        fetch(url, {
            method,
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to save question');
            return res.json();
        })
        .then(() => {
            fetchQuestions(); // Refresh list
            closeModal();
        })
        .catch(err => console.error(err.message));
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            fetch(`http://localhost:8081/api/admin/questions/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
                .then(res => {
                    if (!res.ok) throw new Error('Failed to delete');
                    fetchQuestions(); // Refresh list
                })
                .catch(err => console.error(err.message));
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (editingQuestion) {
            if (name === 'categoryId') {
                setEditingQuestion({ ...editingQuestion, category: { id: Number(value) } as Category });
            } else {
                setEditingQuestion({ ...editingQuestion, [name]: value });
            }
        }
    };
    
    const handleFallbackChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (editingQuestion && editingQuestion.fallbackOptions) {
            const updatedFallbacks = [...editingQuestion.fallbackOptions];
            updatedFallbacks[index] = { ...updatedFallbacks[index], [name]: value };
            setEditingQuestion({ ...editingQuestion, fallbackOptions: updatedFallbacks });
        }
    };

    const handleAddFallback = () => {
        if (editingQuestion && editingQuestion.fallbackOptions) {
            setEditingQuestion({
                ...editingQuestion,
                fallbackOptions: [
                    ...editingQuestion.fallbackOptions,
                    { fallbackFr: '', fallbackEn: '', fallbackAr: '' }
                ]
            });
        }
    };

    const [importFile, setImportFile] = useState<File | null>(null);
    const [importResult, setImportResult] = useState<{imported: number, errors: string[]}|null>(null);
    const [importLoading, setImportLoading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImportFile(e.target.files[0]);
        }
    };
    const handleImport = async () => {
        if (!importFile) return;
        setImportLoading(true);
        setImportResult(null);
        const formData = new FormData();
        formData.append('file', importFile);
        try {
            const res = await fetch('http://localhost:8081/api/admin/questions/import', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: formData as any
            } as any);
            if (!res.ok) throw new Error('Import failed');
            const data = await res.json();
            setImportResult(data);
            fetchQuestions();
        } catch (err: any) {
            setImportResult({imported: 0, errors: [err.message]});
        } finally {
            setImportLoading(false);
        }
    };
    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleToggleFilters = () => {
        setShowFilters(f => {
            if (f) {
                // Hiding filters: reset all filter values
                setFilters({ id: '', category: '', difficulty: '', questionTextEn: '' });
            }
            return !f;
        });
    };

    const [showUploadModal, setShowUploadModal] = useState(false);

    return (
        <div className="admin-card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h1>Manage Questions</h1>
                <div style={{display: 'flex', gap: '1rem'}}>
                    <button
                      className="admin-icon-btn"
                      onClick={handleToggleFilters}
                      title={showFilters ? 'Hide Filters' : 'Show Filters'}
                      aria-label={showFilters ? 'Hide Filters' : 'Show Filters'}
                      style={{ background: '#e1eebc', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <FaFilter size={22} color="#328e6e" />
                    </button>
                    <button
                      className="admin-icon-btn"
                      onClick={() => openModal(null)}
                      title="Add Question"
                      aria-label="Add Question"
                      style={{ background: '#e1eebc', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <FaPlus size={22} color="#328e6e" />
                    </button>
                    <button
                      className="admin-icon-btn"
                      onClick={() => setShowUploadModal(true)}
                      title="Import Excel"
                      aria-label="Import Excel"
                      style={{ background: '#e1eebc', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <FaUpload size={22} color="#328e6e" />
                    </button>
                </div>
            </div>
            {/* Upload Modal/Dropzone */}
            {showUploadModal && (
                <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="upload-modal" onClick={e => e.stopPropagation()}>
                        {/* Close Icon Button */}
                        <button
                            className="upload-close-btn"
                            onClick={() => setShowUploadModal(false)}
                            title="Close"
                            aria-label="Close"
                        >
                            <FaTimes size={26} color="#328e6e" />
                        </button>
                        <h2>Import Questions from Excel</h2>
                        <div className="upload-dropzone" onClick={handleFileButtonClick} style={{cursor: 'pointer'}}>
                            <input
                                type="file"
                                accept=".xlsx"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120}}>
                                <svg width="48" height="48" fill="none" stroke="#328e6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                <span style={{marginTop: 12, color: '#328e6e', fontWeight: 600}}>{importFile ? importFile.name : 'Click to choose Excel file (.xlsx)'}</span>
                            </div>
                        </div>
                        <button
                            className="admin-btn"
                            onClick={handleImport}
                            disabled={!importFile || importLoading}
                            style={{ marginTop: 20, minWidth: 120 }}
                        >
                            {importLoading ? 'Importing...' : 'Import Excel'}
                        </button>
                        {importResult && (
                            <div style={{marginTop: '1rem'}}>
                                <b>Imported:</b> {importResult.imported} <br/>
                                {importResult.errors.length > 0 && (
                                    <span style={{color: 'red'}}>
                                        Errors:<ul>{importResult.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="admin-filters" style={{marginBottom: '1rem', display: showFilters ? 'flex' : 'none', gap: '1rem'}}>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th style={{width: '7%', textAlign: 'center'}}>ID</th>
                        <th style={{width: '13%', textAlign: 'center'}}>Category</th>
                        <th style={{width: '13%', textAlign: 'center'}}>Difficulty</th>
                        <th style={{width: '60%', textAlign: 'center'}}>Question (EN)</th>
                        <th style={{width: '7%', textAlign: 'center'}}>Actions</th>
                    </tr>
                    {showFilters && (
                    <tr>
                        <th style={{width: '7%', textAlign: 'center'}}>
                            <input className="admin-filter-input" style={{width: '40px', maxWidth: '40px', textAlign: 'center'}} value={filters.id} onChange={e => setFilters(f => ({...f, id: e.target.value}))} placeholder="ID" />
                        </th>
                        <th style={{width: '13%', textAlign: 'center'}}>
                            <select className="admin-filter-input" value={filters.category} onChange={e => setFilters(f => ({...f, category: e.target.value}))}>
                                <option value="">All</option>
                                {categories.map(c => <option key={c.id} value={c.nameEn}>{c.nameEn}</option>)}
                            </select>
                        </th>
                        <th style={{width: '13%', textAlign: 'center'}}>
                            <select className="admin-filter-input" value={filters.difficulty} onChange={e => setFilters(f => ({...f, difficulty: e.target.value}))}>
                                <option value="">All</option>
                                <option value="1">Easy</option>
                                <option value="2">Medium</option>
                                <option value="3">Hard</option>
                            </select>
                        </th>
                        <th style={{width: '60%', textAlign: 'center'}}><input className="admin-filter-input" value={filters.questionTextEn} onChange={e => setFilters(f => ({...f, questionTextEn: e.target.value}))} placeholder="Question" /></th>
                        <th style={{width: '7%', textAlign: 'center'}}></th>
                    </tr>
                    )}
                </thead>
                <tbody>
                    {questions.map(q => (
                        <tr key={q.id}>
                            <td style={{width: '7%', textAlign: 'center'}}>{q.id}</td>
                            <td style={{width: '13%', textAlign: 'center'}}>{q.category.nameEn}</td>
                            <td style={{width: '13%', textAlign: 'center'}}>{difficultyLabel(q.difficulty)}</td>
                            <td style={{width: '60%', textAlign: 'center'}}>{q.questionTextEn}</td>
                            <td style={{width: '7%', textAlign: 'center'}}>
                                <button className="admin-action-btn edit" title="Edit" onClick={() => openModal(q)}>
                                  <FaEdit size={18} color="#328e6e" />
                                </button>
                                <button className="admin-action-btn delete" title="Delete" onClick={() => handleDelete(q.id)}>
                                  <FaTrash size={18} color="#c0392b" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls - modern look */}
            <div className="modern-pagination" aria-label="Pagination Navigation">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} aria-label="Previous Page">Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={i === page ? 'active' : ''}
                        aria-current={i === page ? 'page' : undefined}
                        disabled={i === page}
                        aria-label={`Page ${i + 1}`}
                    >
                        {i + 1}
                    </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} aria-label="Next Page">Next</button>
            </div>

            <Modal isOpen={isModalOpen} onRequestClose={closeModal} 
                className="admin-modal-card"
                overlayClassName="admin-modal-overlay"
                style={{content: {inset: '20px', maxWidth: '800px', margin: 'auto'}}}>
                <h2>{editingQuestion?.id ? 'Edit' : 'Create'} Question</h2>
                {editingQuestion && (
                    <form onSubmit={handleSave} className="admin-form" style={{maxHeight: '80vh', overflowY: 'auto'}}>
                        {/* Category and Difficulty */}
                        <select name="categoryId" value={editingQuestion.category?.id || ''} onChange={handleInputChange} required>
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
                        </select>
                        <select name="difficulty" value={editingQuestion.difficulty || 1} onChange={handleInputChange} required>
                            <option value="1">Easy</option>
                            <option value="2">Medium</option>
                            <option value="3">Hard</option>
                        </select>

                        {/* Multilingual Fields */}
                        <fieldset><legend>Question Text</legend>
                            <input name="questionTextFr" value={editingQuestion.questionTextFr || ''} onChange={handleInputChange} placeholder="Question (FR)" />
                            <input name="questionTextEn" value={editingQuestion.questionTextEn || ''} onChange={handleInputChange} placeholder="Question (EN)" required />
                            <input name="questionTextAr" value={editingQuestion.questionTextAr || ''} onChange={handleInputChange} placeholder="Question (AR)" />
                        </fieldset>
                        <fieldset><legend>Correct Answer</legend>
                            <input name="correctAnswerFr" value={editingQuestion.correctAnswerFr || ''} onChange={handleInputChange} placeholder="Correct Answer (FR)" />
                            <input name="correctAnswerEn" value={editingQuestion.correctAnswerEn || ''} onChange={handleInputChange} placeholder="Correct Answer (EN)" required />
                            <input name="correctAnswerAr" value={editingQuestion.correctAnswerAr || ''} onChange={handleInputChange} placeholder="Correct Answer (AR)" />
                        </fieldset>
                        <fieldset><legend>Trap Answer</legend>
                            <input name="trapAnswerFr" value={editingQuestion.trapAnswerFr || ''} onChange={handleInputChange} placeholder="Trap Answer (FR)" />
                            <input name="trapAnswerEn" value={editingQuestion.trapAnswerEn || ''} onChange={handleInputChange} placeholder="Trap Answer (EN)" />
                            <input name="trapAnswerAr" value={editingQuestion.trapAnswerAr || ''} onChange={handleInputChange} placeholder="Trap Answer (AR)" />
                        </fieldset>
                        
                        <fieldset><legend>Fallback Options</legend>
                            {editingQuestion.fallbackOptions?.map((opt, i) => (
                                <div key={i} style={{display: 'flex', gap: '0.5rem', marginBottom: '0.5rem'}}>
                                    <input name="fallbackFr" value={opt.fallbackFr} onChange={e => handleFallbackChange(i, e)} placeholder={`Fallback ${i+1} (FR)`} />
                                    <input name="fallbackEn" value={opt.fallbackEn} onChange={e => handleFallbackChange(i, e)} placeholder={`Fallback ${i+1} (EN)`} />
                                    <input name="fallbackAr" value={opt.fallbackAr} onChange={e => handleFallbackChange(i, e)} placeholder={`Fallback ${i+1} (AR)`} />
                                </div>
                            ))}
                            <button type="button" className="admin-btn" style={{width: 'auto', minWidth: '2.5rem', padding: '0.5rem 1rem', fontSize: '1.2rem', marginTop: '0.5rem'}} onClick={handleAddFallback}>+
                            </button>
                        </fieldset>

                        <div style={{width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem'}}>
                            <button type="button" className="admin-btn-secondary" onClick={closeModal}>Cancel</button>
                            <button type="submit" className="admin-btn">Save</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default ManageQuestions; 