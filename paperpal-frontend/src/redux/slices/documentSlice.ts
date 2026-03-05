import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Document } from "../../types/document.types";

interface DocumentState {
  currentDocument: Document | null;
  documents: Document[];
  loading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  currentDocument: null,
  documents: [],
  loading: false,
  error: null,
};

const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    setCurrentDocument: (state, action: PayloadAction<Document>) => {
      state.currentDocument = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { setCurrentDocument, setLoading, setError } = documentSlice.actions;
export default documentSlice.reducer;
