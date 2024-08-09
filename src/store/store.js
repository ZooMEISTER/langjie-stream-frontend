import { configureStore } from '@reduxjs/toolkit'
import { getDefaultMiddleware } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // 选择持久化存储引擎，如 localStorage 或 AsyncStorage

import rootReducer from './modules';

// 配置持久化设置
const persistConfig = {
    key: "root", // 存储的键名
    storage, // 持久化存储引擎
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})

const persistor = persistStore(store);

export { store, persistor };