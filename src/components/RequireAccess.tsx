import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../useAuth.ts';
import { RowsSkeleton } from './Skeleton.tsx';

// Пускает к каталогу только сотрудников и оплативших покупателей.
// Настоящая защита — в базе (has_access в витрине), здесь только навигация
const RequireAccess = ({ children }: { children: ReactNode }) => {
    const { session, hasAccess, loading } = useAuth();

    if (loading) {
        return (
            <div className="bg-ground min-h-screen">
                <div className="pt-safe px-5 pb-4">
                    <div className="bg-line h-8 w-40 animate-pulse rounded" />
                </div>
                <RowsSkeleton />
            </div>
        );
    }

    if (!session) return <Navigate to="/login" replace />;
    if (!hasAccess) return <Navigate to="/subscribe" replace />;

    return children;
};

export default RequireAccess;
