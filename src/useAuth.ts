import { useEffect, useState } from 'react';

import type { Session } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase.ts';
import { isActiveUntil } from './dates.ts';
import { profileKeys } from './queryKey.ts';

export type Role = 'admin' | 'agent' | 'viewer';

type Profile = { role: Role; paidUntil: string | null };

export const useAuth = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setAuthLoading(false);
        });

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {
                setSession(newSession);
                setAuthLoading(false);
            }
        );
        return () => listener.subscription.unsubscribe();
    }, []);

    const userId = session?.user.id;

    const profileQuery = useQuery({
        queryKey: profileKeys.detail(userId),
        enabled: !!userId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('role, paidUntil')
                .eq('id', userId!)
                .maybeSingle();

            if (error) throw error;
            return (data ?? null) as Profile | null;
        },
    });

    const profile = userId ? (profileQuery.data ?? null) : null;
    const role = profile?.role ?? null;
    const paidUntil = profile?.paidUntil ?? null;

    const isStaff = role === 'admin' || role === 'agent';
    const isPaid = isActiveUntil(paidUntil);

    return {
        session,
        role,
        paidUntil,
        loading: authLoading || profileQuery.isLoading,
        isStaff,
        isAdmin: role === 'admin',
        isPaid,
        // каталог видят сотрудники и оплатившие покупатели
        hasAccess: isStaff || isPaid,
    };
};
