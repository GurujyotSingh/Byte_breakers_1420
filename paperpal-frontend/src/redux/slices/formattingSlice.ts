import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FormattingRules, ComplianceReport } from "../../types/formatting.types";

interface FormattingState {
  rules: FormattingRules | null;
  compliance: ComplianceReport | null;
  loading: boolean;
  error: string | null;
}

const initialState: FormattingState = {
  rules: null,
  compliance: null,
  loading: false,
  error: null,
};

const formattingSlice = createSlice({
  name: "formatting",
  initialState,
  reducers: {
    setRules: (state, action: PayloadAction<FormattingRules>) => {
      state.rules = action.payload;
    },
    setCompliance: (state, action: PayloadAction<ComplianceReport>) => {
      state.compliance = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { setRules, setCompliance, setLoading, setError } = formattingSlice.actions;
export default formattingSlice.reducer;
