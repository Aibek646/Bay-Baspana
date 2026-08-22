import { useEffect, useState } from 'react';

import type { Session } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase.ts';

export type Role = 'admin' | 'agent' | 'viewer';

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

    const roleQuery = useQuery({
        queryKey: ['role', userId],
        enabled: !!userId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId!)
                .maybeSingle();

            if (error) throw error;
            return (data?.role ?? null) as Role | null;
        },
    });

    const role = userId ? (roleQuery.data ?? null) : null;

    return {
        session,
        role,
        loading: authLoading || roleQuery.isLoading,
        isStaff: role === 'admin' || role === 'agent',
        isAdmin: role === 'admin',
    };
};
