'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Document, DocumentType, DocumentCategory, DocumentStatus } from '@/lib/types';

// Типи для дій
interface DocumentsState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  selectedDocument: Document | null;
  filters: {
    category: string;
    type: string;
    status: string;
    search: string;
  };
  viewMode: 'grid' | 'list';
}

type DocumentsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: { id: string; updates: Partial<Document> } }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'SET_SELECTED_DOCUMENT'; payload: Document | null }
  | { type: 'SET_FILTERS'; payload: Partial<DocumentsState['filters']> }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'CLEAR_ERROR' };

// Початковий стан
const initialState: DocumentsState = {
  documents: [],
  isLoading: false,
  error: null,
  selectedDocument: null,
  filters: {
    category: 'all',
    type: 'all',
    status: 'all',
    search: '',
  },
  viewMode: 'grid',
};

// Редуктор
function documentsReducer(state: DocumentsState, action: DocumentsAction): DocumentsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload };
    
    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.payload] };
    
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id
            ? { ...doc, ...action.payload.updates }
            : doc
        ),
        selectedDocument: state.selectedDocument?.id === action.payload.id
          ? { ...state.selectedDocument, ...action.payload.updates }
          : state.selectedDocument,
      };
    
    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload),
        selectedDocument: state.selectedDocument?.id === action.payload
          ? null
          : state.selectedDocument,
      };
    
    case 'SET_SELECTED_DOCUMENT':
      return { ...state, selectedDocument: action.payload };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// Контекст
interface DocumentsContextType {
  state: DocumentsState;
  dispatch: React.Dispatch<DocumentsAction>;
  // Дії
  loadDocuments: () => Promise<void>;
  createDocument: (document: Omit<Document, 'id' | 'createdDate' | 'lastModified'>) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  selectDocument: (document: Document | null) => void;
  setFilters: (filters: Partial<DocumentsState['filters']>) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  clearError: () => void;
  // Утиліти
  getFilteredDocuments: () => Document[];
  getDocumentById: (id: string) => Document | undefined;
  getDocumentsByCategory: (category: string) => Document[];
  getDocumentsByType: (type: string) => Document[];
  getDocumentsByStatus: (status: string) => Document[];
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

// Провайдер
export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(documentsReducer, initialState);

  // Завантаження документів
  const loadDocuments = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // TODO: Замінити на реальний API запит
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Failed to load documents');
      }
      
      const documents = await response.json();
      dispatch({ type: 'SET_DOCUMENTS', payload: documents });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Створення документа
  const createDocument = async (document: Omit<Document, 'id' | 'createdDate' | 'lastModified'>): Promise<Document> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // TODO: Замінити на реальний API запит
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(document),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create document');
      }
      
      const newDocument = await response.json();
      dispatch({ type: 'ADD_DOCUMENT', payload: newDocument });
      return newDocument;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Оновлення документа
  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // TODO: Замінити на реальний API запит
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update document');
      }
      
      dispatch({ type: 'UPDATE_DOCUMENT', payload: { id, updates } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Видалення документа
  const deleteDocument = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // TODO: Замінити на реальний API запит
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      dispatch({ type: 'DELETE_DOCUMENT', payload: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Вибір документа
  const selectDocument = (document: Document | null) => {
    dispatch({ type: 'SET_SELECTED_DOCUMENT', payload: document });
  };

  // Встановлення фільтрів
  const setFilters = (filters: Partial<DocumentsState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  // Встановлення режиму перегляду
  const setViewMode = (mode: 'grid' | 'list') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  // Очищення помилки
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Отримання відфільтрованих документів
  const getFilteredDocuments = (): Document[] => {
    let filtered = state.documents;

    // Фільтр по категорії
    if (state.filters.category !== 'all') {
      filtered = filtered.filter(doc => doc.category === state.filters.category);
    }

    // Фільтр по типу
    if (state.filters.type !== 'all') {
      filtered = filtered.filter(doc => doc.type === state.filters.type);
    }

    // Фільтр по статусу
    if (state.filters.status !== 'all') {
      filtered = filtered.filter(doc => doc.status === state.filters.status);
    }

    // Фільтр по пошуку
    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchLower) ||
        doc.content.toLowerCase().includes(searchLower) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  };

  // Отримання документа по ID
  const getDocumentById = (id: string): Document | undefined => {
    return state.documents.find(doc => doc.id === id);
  };

  // Отримання документів по категорії
  const getDocumentsByCategory = (category: string): Document[] => {
    return state.documents.filter(doc => doc.category === category);
  };

  // Отримання документів по типу
  const getDocumentsByType = (type: string): Document[] => {
    return state.documents.filter(doc => doc.type === type);
  };

  // Отримання документів по статусу
  const getDocumentsByStatus = (status: string): Document[] => {
    return state.documents.filter(doc => doc.status === status);
  };

  const value: DocumentsContextType = {
    state,
    dispatch,
    loadDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    selectDocument,
    setFilters,
    setViewMode,
    clearError,
    getFilteredDocuments,
    getDocumentById,
    getDocumentsByCategory,
    getDocumentsByType,
    getDocumentsByStatus,
  };

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
}

// Хук для використання контексту
export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
}
