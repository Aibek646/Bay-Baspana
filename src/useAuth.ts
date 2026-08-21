import { useEffect, useState } from 'react';

import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase.ts';

export type Role = 'admin' | 'agent' | 'viewer';

type Profile = { userId: string; role: Role | null };

export const useAuth = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);

    // 1) следим за сессией — без изменений
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

    // 2) есть пользователь — грузим его профиль. setState только в колбэке ответа
    useEffect(() => {
        if (!userId) return;

        let cancelled = false;

        supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle()
            .then(({ data, error }) => {
                if (cancelled) return;
                setProfile({
                    userId,
                    role: error || !data ? null : (data.role as Role),
                });
            });

        return () => {
            cancelled = true;
        };
    }, [userId]);

    // роль не хранится, а вычисляется:
    // null = роли нет, undefined = ещё не знаем
    const role: Role | null | undefined = !userId
        ? null
        : profile?.userId === userId
          ? profile.role
          : undefined;

    return {
        session,
        role,
        loading: authLoading || role === undefined,
        isStaff: role === 'admin' || role === 'agent',
        isAdmin: role === 'admin',
    };
};
