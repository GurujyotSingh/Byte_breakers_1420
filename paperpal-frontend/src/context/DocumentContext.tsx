import React, { createContext, useContext, useReducer } from 'react';
import { Document, DocumentStructure } from '../types/document.types';

interface DocumentState {
  currentDocument: Document | null;
  structure: DocumentStructure | null;
  loading: boolean;
  error: string | null;
  history: Document[];
}

type DocumentAction =
  | { type: 'SET_DOCUMENT'; payload: Document }
  | { type: 'SET_STRUCTURE'; payload: DocumentStructure }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'ADD_TO_HISTORY'; payload: Document };

const initialState: DocumentState = {
  currentDocument: null,
  structure: null,
  loading: false,
  error: null,
  history: []
};

const DocumentContext = createContext<{
  state: DocumentState;
  dispatch: React.Dispatch<DocumentAction>;
} | undefined>(undefined);

const documentReducer = (state: DocumentState, action: DocumentAction): DocumentState => {
  switch (action.type) {
    case 'SET_DOCUMENT':
      return { ...state, currentDocument: action.payload };
    case 'SET_STRUCTURE':
      return { ...state, structure: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        history: [action.payload, ...state.history].slice(0, 10)
      };
    default:
      return state;
  }
};

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  return (
    <DocumentContext.Provider value={{ state, dispatch }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within DocumentProvider');
  }
  return context;
};