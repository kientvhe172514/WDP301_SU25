import { combineReducers, configureStore } from "@reduxjs/toolkit";
import accountReducer from "./accountSlice";  // Updated from `userSlice`

import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// Redux Persist Config
const persistConfig = {
    key: "root",
    version: 1,
    storage,
    blacklist: ["booking", "room"],  // Prevent persisting live data
};

// Root Reducer
const rootReducer = combineReducers({
    account: accountReducer,  
});

// Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store Configuration
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

// Persistor
export let persistor = persistStore(store);
