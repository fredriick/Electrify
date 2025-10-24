import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StoreSettingsState {
  storeName: string;
}

const initialState: StoreSettingsState = {
  storeName: 'Electrify Solar Store',
};

const storeSettingsSlice = createSlice({
  name: 'storeSettings',
  initialState,
  reducers: {
    setStoreName: (state, action: PayloadAction<string>) => {
      state.storeName = action.payload;
    },
  },
});

export const { setStoreName } = storeSettingsSlice.actions;
export default storeSettingsSlice.reducer; 