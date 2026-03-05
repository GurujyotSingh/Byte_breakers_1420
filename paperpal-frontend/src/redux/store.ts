import { configureStore } from "@reduxjs/toolkit";
import documentReducer from "./slices/documentSlice";
import formattingReducer from "./slices/formattingSlice";

export const store = configureStore({
  reducer: {
    document: documentReducer,
    formatting: formattingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
