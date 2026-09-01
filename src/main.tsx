import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import {
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { supabase } from './supabase.ts';
import { isAccessError } from './errors.ts';

const queryClient = new QueryClient({
    // Сессия истекла или база отказала в правах — молча выкидываем на вход.
    // Иначе пользователь видит «проверьте интернет» при живом интернете
    queryCache: new QueryCache({
        onError: (error) => {
            if (isAccessError(error)) {
                void supabase.auth.signOut();
            }
        },
    }),
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
        },
    },
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>
);
