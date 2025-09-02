'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Email, EmailTemplate, Document, StudentGrade, AnalyticsData } from '@/lib/types';

// Типи для стану додатку
interface AppState {
  user: User | null;
  emails: Email[];
  emailTemplates: EmailTemplate[];
  documents: Document[];
  grades: StudentGrade[];
  analytics: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  selectedEmail: Email | null;
  selectedDocument: Document | null;
  filters: {
    emailCategory: string;
    emailPriority: string;
    documentType: string;
    dateRange: { start: string; end: string };
  };
}

// Типи для дій
type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_EMAILS'; payload: Email[] }
  | { type: 'ADD_EMAIL'; payload: Email }
  | { type: 'UPDATE_EMAIL'; payload: { id: string; updates: Partial<Email> } }
  | { type: 'DELETE_EMAIL'; payload: string }
  | { type: 'SET_EMAIL_TEMPLATES'; payload: EmailTemplate[] }
  | { type: 'ADD_EMAIL_TEMPLATE'; payload: EmailTemplate }
  | { type: 'UPDATE_EMAIL_TEMPLATE'; payload: { id: string; updates: Partial<EmailTemplate> } }
  | { type: 'DELETE_EMAIL_TEMPLATE'; payload: string }
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: { id: string; updates: Partial<Document> } }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'SET_GRADES'; payload: StudentGrade[] }
  | { type: 'SET_ANALYTICS'; payload: AnalyticsData }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_EMAIL'; payload: Email | null }
  | { type: 'SET_SELECTED_DOCUMENT'; payload: Document | null }
  | { type: 'SET_FILTERS'; payload: Partial<AppState['filters']> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'RESET_STATE' };

// Початковий стан
const initialState: AppState = {
  user: null,
  emails: [],
  emailTemplates: [],
  documents: [],
  grades: [],
  analytics: null,
  isLoading: false,
  error: null,
  selectedEmail: null,
  selectedDocument: null,
  filters: {
    emailCategory: '',
    emailPriority: '',
    documentType: '',
    dateRange: { start: '', end: '' },
  },
};

// Редуктор для управління станом
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_EMAILS':
      return { ...state, emails: action.payload };
    
    case 'ADD_EMAIL':
      return { ...state, emails: [action.payload, ...state.emails] };
    
    case 'UPDATE_EMAIL':
      return {
        ...state,
        emails: state.emails.map(email =>
          email.id === action.payload.id
            ? { ...email, ...action.payload.updates }
            : email
        ),
      };
    
    case 'DELETE_EMAIL':
      return {
        ...state,
        emails: state.emails.filter(email => email.id !== action.payload),
      };
    
    case 'SET_EMAIL_TEMPLATES':
      return { ...state, emailTemplates: action.payload };
    
    case 'ADD_EMAIL_TEMPLATE':
      return { ...state, emailTemplates: [...state.emailTemplates, action.payload] };
    
    case 'UPDATE_EMAIL_TEMPLATE':
      return {
        ...state,
        emailTemplates: state.emailTemplates.map(template =>
          template.id === action.payload.id
            ? { ...template, ...action.payload.updates }
            : template
        ),
      };
    
    case 'DELETE_EMAIL_TEMPLATE':
      return {
        ...state,
        emailTemplates: state.emailTemplates.filter(template => template.id !== action.payload),
      };
    
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
      };
    
    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload),
      };
    
    case 'SET_GRADES':
      return { ...state, grades: action.payload };
    
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_SELECTED_EMAIL':
      return { ...state, selectedEmail: action.payload };
    
    case 'SET_SELECTED_DOCUMENT':
      return { ...state, selectedDocument: action.payload };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Контекст
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Допоміжні функції
  setUser: (user: User) => void;
  setEmails: (emails: Email[]) => void;
  addEmail: (email: Email) => void;
  updateEmail: (id: string, updates: Partial<Email>) => void;
  deleteEmail: (id: string) => void;
  setEmailTemplates: (templates: EmailTemplate[]) => void;
  setDocuments: (documents: Document[]) => void;
  setGrades: (grades: StudentGrade[]) => void;
  setAnalytics: (analytics: AnalyticsData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedEmail: (email: Email | null) => void;
  setSelectedDocument: (document: Document | null) => void;
  setFilters: (filters: Partial<AppState['filters']>) => void;
  clearFilters: () => void;
  resetState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Провайдер контексту
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Допоміжні функції
  const setUser = (user: User) => dispatch({ type: 'SET_USER', payload: user });
  const setEmails = (emails: Email[]) => dispatch({ type: 'SET_EMAILS', payload: emails });
  const addEmail = (email: Email) => dispatch({ type: 'ADD_EMAIL', payload: email });
  const updateEmail = (id: string, updates: Partial<Email>) =>
    dispatch({ type: 'UPDATE_EMAIL', payload: { id, updates } });
  const deleteEmail = (id: string) => dispatch({ type: 'DELETE_EMAIL', payload: id });
  const setEmailTemplates = (templates: EmailTemplate[]) =>
    dispatch({ type: 'SET_EMAIL_TEMPLATES', payload: templates });
  const setDocuments = (documents: Document[]) =>
    dispatch({ type: 'SET_DOCUMENTS', payload: documents });
  const setGrades = (grades: StudentGrade[]) =>
    dispatch({ type: 'SET_GRADES', payload: grades });
  const setAnalytics = (analytics: AnalyticsData) =>
    dispatch({ type: 'SET_ANALYTICS', payload: analytics });
  const setLoading = (loading: boolean) =>
    dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string | null) =>
    dispatch({ type: 'SET_ERROR', payload: error });
  const setSelectedEmail = (email: Email | null) =>
    dispatch({ type: 'SET_SELECTED_EMAIL', payload: email });
  const setSelectedDocument = (document: Document | null) =>
    dispatch({ type: 'SET_SELECTED_DOCUMENT', payload: document });
  const setFilters = (filters: Partial<AppState['filters']>) =>
    dispatch({ type: 'SET_FILTERS', payload: filters });
  const clearFilters = () => dispatch({ type: 'CLEAR_FILTERS' });
  const resetState = () => dispatch({ type: 'RESET_STATE' });

  const value: AppContextType = {
    state,
    dispatch,
    setUser,
    setEmails,
    addEmail,
    updateEmail,
    deleteEmail,
    setEmailTemplates,
    setDocuments,
    setGrades,
    setAnalytics,
    setLoading,
    setError,
    setSelectedEmail,
    setSelectedDocument,
    setFilters,
    clearFilters,
    resetState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Хук для використання контексту
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Хуки для окремих частин стану
export function useUser() {
  const { state, setUser } = useApp();
  return { user: state.user, setUser };
}

export function useEmails() {
  const { state, setEmails, addEmail, updateEmail, deleteEmail } = useApp();
  return {
    emails: state.emails,
    setEmails,
    addEmail,
    updateEmail,
    deleteEmail,
  };
}

export function useEmailTemplates() {
  const { state, setEmailTemplates } = useApp();
  return { emailTemplates: state.emailTemplates, setEmailTemplates };
}

export function useDocuments() {
  const { state, setDocuments } = useApp();
  return { documents: state.documents, setDocuments };
}

export function useGrades() {
  const { state, setGrades } = useApp();
  return { grades: state.grades, setGrades };
}

export function useAnalytics() {
  const { state, setAnalytics } = useApp();
  return { analytics: state.analytics, setAnalytics };
}

export function useLoading() {
  const { state, setLoading } = useApp();
  return { isLoading: state.isLoading, setLoading };
}

export function useError() {
  const { state, setError } = useApp();
  return { error: state.error, setError };
}

export function useFilters() {
  const { state, setFilters, clearFilters } = useApp();
  return { filters: state.filters, setFilters, clearFilters };
}
