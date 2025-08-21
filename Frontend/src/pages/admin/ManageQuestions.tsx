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
        setErrorMessage(null);
    };

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    // Validate all fields
    const validateFields = (): string | null => {
        const allFields = [
        { name: 'questionTextFr', value: editingQuestion?.questionTextFr },
        { name: 'questionTextEn', value: editingQuestion?.questionTextEn },
        { name: 'questionTextAr', value: editingQuestion?.questionTextAr },
        { name: 'correctAnswerFr', value: editingQuestion?.correctAnswerFr },
        { name: 'correctAnswerEn', value: editingQuestion?.correctAnswerEn },
        { name: 'correctAnswerAr', value: editingQuestion?.correctAnswerAr },
        { name: 'trapAnswerFr', value: editingQuestion?.trapAnswerFr },
        { name: 'trapAnswerEn', value: editingQuestion?.trapAnswerEn },
        { name: 'trapAnswerAr', value: editingQuestion?.trapAnswerAr },
        { name: 'categoryId', value: editingQuestion?.category?.id },
        ];
        const emptyFields = allFields.filter(field => !field.value || (typeof field.value === 'string' && field.value.trim() === ''));
    
        const emptyFallbacks = editingQuestion?.fallbackOptions?.some(opt =>
        opt.fallbackFr.trim() === '' || opt.fallbackEn.trim() === '' || opt.fallbackAr.trim() === ''
        ) || false;
    
        if (emptyFields.length > 0 || emptyFallbacks) {
        return `Please fill all fields: ${emptyFields.map(f => f.name).join(', ')}${
            emptyFallbacks ? (emptyFields.length > 0 ? ' and ensure all fallback options are complete' : 'Ensure all fallback options are complete') : ''
        }.`;
        }
        return null;
    };
    
    // Prepare the payload for the API
    const preparePayload = (): any => {
        if (!editingQuestion) return {};
        return {
        ...editingQuestion,
        category: { id: editingQuestion.category?.id }
        };
    };
    
    // Handle the API call
    const performSave = (method: string, url: string, payload: any) => {
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
    
    // Replace the existing handleSave function with this:
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingQuestion) return;
    
        const error = validateFields();
        if (error) {
        setErrorMessage(error);
        return;
        }
    
        const method = editingQuestion.id ? 'PUT' : 'POST';
        const url = editingQuestion.id ? `http://localhost:8081/api/admin/questions/${editingQuestion.id}` : 'http://localhost:8081/api/admin/questions';
        const payload = preparePayload();
    
        performSave(method, url, payload);
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

    const handleCloseUploadModal = () => {
        setShowUploadModal(false);
        setImportResult(null); // Clear import results when closing modal
        setImportFile(null); // Clear selected file
    };

    const handleDeleteFallback = (index: number) => {
        if (editingQuestion && editingQuestion.fallbackOptions) {
            const updatedFallbacks = [...editingQuestion.fallbackOptions];
            updatedFallbacks.splice(index, 1);
            setEditingQuestion({ ...editingQuestion, fallbackOptions: updatedFallbacks });
        }
    };

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
                    >
                      <FaFilter/>
                    </button>
                    <button
                      className="admin-icon-btn"
                      onClick={() => openModal(null)}
                      title="Add Question"
                      aria-label="Add Question"
                    >
                      <FaPlus/>
                    </button>
                    <button
                      className="admin-icon-btn"
                      onClick={() => setShowUploadModal(true)}
                      title="Import Excel"
                      aria-label="Import Excel"
                    >
                      <FaUpload/>
                    </button>
                </div>
            </div>
            {/* Upload Modal/Dropzone */}
            {showUploadModal && (
                <div className="upload-modal-overlay" onClick={handleCloseUploadModal}>
                    <div className="upload-modal" onClick={e => e.stopPropagation()}>
                        {/* Close Icon Button */}
                        <button
                            className="upload-close-btn"
                            onClick={handleCloseUploadModal}
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
                            <div style={{marginTop: '1rem', width: '100%'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                                    <span style={{color: '#328e6e', fontWeight: '600'}}>✓ Imported:</span>
                                    <span style={{fontWeight: '600'}}>{importResult.imported}</span>
                                </div>
                                {importResult.errors.length > 0 && (
                                    <div className="import-errors-container">
                                        <div className="import-errors-header">
                                            <span style={{color: '#e74c3c', fontWeight: '600'}}>⚠ Errors ({importResult.errors.length}):</span>
                                        </div>
                                        <div className="import-errors-list">
                                            {importResult.errors.map((error, i) => (
                                                <div key={i} className="import-error-item">
                                                    {error}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                className="question-modal"
                overlayClassName="upload-modal-overlay"
            >
                <div className="question-modal-content">
                    <button
                        className="upload-close-btn"
                        onClick={closeModal}
                        title="Close"
                        aria-label="Close"
                    >
                        <FaTimes size={26} color="#328e6e" />
                    </button>
                    <h2>{editingQuestion?.id ? 'Edit Question' : 'Add Question'}</h2>
                    {editingQuestion && (
                        <form onSubmit={handleSave} className="question-form">
                            <div className="form-section">
                                <label>Category</label>
                                <select name="categoryId" value={editingQuestion.category?.id || ''} onChange={handleInputChange} required>
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.nameEn}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-section">
                                <label>Difficulty</label>
                                <select name="difficulty" value={editingQuestion.difficulty || 1} onChange={handleInputChange} required>
                                    <option value="1">Easy</option>
                                    <option value="2">Medium</option>
                                    <option value="3">Hard</option>
                                </select>
                            </div>

                            <div className="form-section">
                                <label>Question Text</label>
                                <div className="input-group multi-input">
                                    <input
                                        name="questionTextFr"
                                        value={editingQuestion.questionTextFr || ''}
                                        onChange={handleInputChange}
                                        placeholder="Question (FR)"
                                    />
                                    <input
                                        name="questionTextEn"
                                        value={editingQuestion.questionTextEn || ''}
                                        onChange={handleInputChange}
                                        placeholder="Question (EN)"
                                        required
                                    />
                                    <input
                                        name="questionTextAr"
                                        value={editingQuestion.questionTextAr || ''}
                                        onChange={handleInputChange}
                                        placeholder="Question (AR)"
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <label>Correct Answer</label>
                                <div className="input-group multi-input">
                                    <input
                                        name="correctAnswerFr"
                                        value={editingQuestion.correctAnswerFr || ''}
                                        onChange={handleInputChange}
                                        placeholder="Correct Answer (FR)"
                                    />
                                    <input
                                        name="correctAnswerEn"
                                        value={editingQuestion.correctAnswerEn || ''}
                                        onChange={handleInputChange}
                                        placeholder="Correct Answer (EN)"
                                        required
                                    />
                                    <input
                                        name="correctAnswerAr"
                                        value={editingQuestion.correctAnswerAr || ''}
                                        onChange={handleInputChange}
                                        placeholder="Correct Answer (AR)"
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <label>Trap Answer</label>
                                <div className="input-group multi-input">
                                    <input
                                        name="trapAnswerFr"
                                        value={editingQuestion.trapAnswerFr || ''}
                                        onChange={handleInputChange}
                                        placeholder="Trap Answer (FR)"
                                    />
                                    <input
                                        name="trapAnswerEn"
                                        value={editingQuestion.trapAnswerEn || ''}
                                        onChange={handleInputChange}
                                        placeholder="Trap Answer (EN)"
                                    />
                                    <input
                                        name="trapAnswerAr"
                                        value={editingQuestion.trapAnswerAr || ''}
                                        onChange={handleInputChange}
                                        placeholder="Trap Answer (AR)"
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <label>Fallback Options</label>
                                {editingQuestion.fallbackOptions?.map((opt, i) => (
                                    <div className='fallback-set' key={i} style={{ marginBottom: '1.5rem' }}>
                                        <div className="fallback-set fallback-group" >
                                                <input
                                                    name="fallbackFr"
                                                    value={opt.fallbackFr}
                                                    onChange={e => handleFallbackChange(i, e)}
                                                    placeholder={`Fallback ${i + 1} (FR)`}
                                                />
                                                <input
                                                    name="fallbackEn"
                                                    value={opt.fallbackEn}
                                                    onChange={e => handleFallbackChange(i, e)}
                                                    placeholder={`Fallback ${i + 1} (EN)`}
                                                />
                                                <input
                                                    name="fallbackAr"
                                                    value={opt.fallbackAr}
                                                    onChange={e => handleFallbackChange(i, e)}
                                                    placeholder={`Fallback ${i + 1} (AR)`}
                                                />
                                                <button
                                                    type="button"
                                                    className="delete-fallback-btn"
                                                    onClick={() => handleDeleteFallback(i)}
                                                    title="Delete Fallback"
                                                    aria-label="Delete Fallback"
                                                >
                                                    <FaTrash size={18} color="#c0392b" />
                                                </button>
                                        </div>
       
                                    </div>
                                ))}

                                
                                <button
                                    type="button"
                                    className="admin-icon-btn"
                                    style={{ width: 'auto', minWidth: '2.5rem', padding: '0.5rem 1rem', fontSize: '1.2rem', marginTop: '0.5rem' }}
                                    onClick={handleAddFallback}
                                    title="Add Fallback Option"
                                    aria-label="Add Fallback Option"
                                >
                                    <FaPlus size={18} />
                                </button>
                            </div>

                            {errorMessage && <div className="error-message" style={{ color: 'white', marginTop: '0.5rem' }}>{errorMessage}</div>}

                            <div className="form-actions" style={{ position: 'sticky', bottom: 0, background: '#fff', padding: '1rem', borderTop: '1px solid #b6e2c6', marginTop: 'auto' }}>
                                <button type="button" className="admin-btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="admin-btn">
                                    Save
                                </button>
                            </div>

                        </form>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default ManageQuestions; 