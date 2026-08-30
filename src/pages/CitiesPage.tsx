import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { City } from '../types.ts';
import { supabase } from '../supabase.ts';
import { useAuth } from '../useAuth.ts';
import { apartmentKeys } from '../queryKey.ts';
import { RowsSkeleton } from '../components/Skeleton.tsx';
import { useRef } from 'react';

type CityCount = { cityId: string; total: number };

const CitiesPage = () => {
    const navigate = useNavigate();

    const { session, isStaff, loading: authLoading } = useAuth();
    const tapsRef = useRef(0);
    const timerRef = useRef<number | undefined>(undefined);

    // три быстрых касания по заголовку — вход для сотрудников
    const handleTitleTap = () => {
        tapsRef.current += 1;
        window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
            tapsRef.current = 0;
        }, 800);

        if (tapsRef.current >= 3) {
            tapsRef.current = 0;
            navigate('/login');
        }
    };

    const citiesQuery = useQuery({
        queryKey: ['cities'],
        queryFn: async () => {
            const { data, error } = await supabase.from('cities').select('*');
            if (error) throw error;
            return data as City[];
        },
    });

    const countsQuery = useQuery({
        queryKey: apartmentKeys.counts(),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('city_apartment_counts')
                .select('*');
            if (error) throw error;
            return data as CityCount[];
        },
    });

    if (authLoading || citiesQuery.isLoading || countsQuery.isLoading) {
        return (
            <div className="bg-ground min-h-screen">
                <div className="pt-safe px-5 pb-4">
                    <div className="bg-line h-8 w-48 animate-pulse rounded" />
                </div>
                <RowsSkeleton />
            </div>
        );
    }

    if (citiesQuery.isError || countsQuery.isError) {
        return (
            <div className="pt-safe bg-ground text-muted min-h-screen p-5">
                Не удалось загрузить данные. Проверьте интернет.
            </div>
        );
    }

    const cities = citiesQuery.data ?? [];

    const counts = new Map(
        (countsQuery.data ?? []).map((row) => [row.cityId, row.total])
    );

    // ↓ дальше разметка без изменений

    return (
        <div className="bg-ground min-h-screen">
            <header className="pt-safe px-5 pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1
                            onClick={handleTitleTap}
                            className="text-ink text-3xl font-bold"
                        >
                            BAY BASPANA
                        </h1>
                        <p className="text-muted mt-1">Объекты недвижимости</p>
                        {isStaff && (
                            <span className="mt-1 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                Режим управления
                            </span>
                        )}
                    </div>
                    {session && (
                        <div className="mt-2 flex flex-col items-end gap-1">
                            <button
                                className="border-line bg-surface text-ink rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 active:opacity-70"
                                onClick={() => supabase.auth.signOut()}
                            >
                                Выйти
                            </button>
                            <button
                                className="px-1 text-xs font-medium text-blue-600 active:opacity-70 dark:text-blue-400"
                                onClick={() => navigate('/password')}
                            >
                                Сменить пароль
                            </button>
                        </div>
                    )}
                </div>
            </header>
            <div className="space-y-3 px-5">
                {cities.map((city) => {
                    const count = counts.get(city.id) ?? 0;
                    return (
                        <button
                            onClick={() => navigate(`/city/${city.id}`)}
                            key={city.id}
                            className="bg-surface flex w-full cursor-pointer items-center justify-between rounded-2xl p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)] transition-all duration-200 active:opacity-70 active:shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                        >
                            <div className="text-left">
                                <div className="text-ink text-lg font-semibold">
                                    {city.name}
                                </div>
                                <div className="text-muted text-sm">
                                    {count} объектов
                                </div>
                            </div>

                            <span className="text-muted text-2xl">›</span>
                        </button>
                    );
                })}
            </div>

            {isStaff && (
                <div className="px-5 pt-3">
                    <button
                        onClick={() => navigate('/contacts')}
                        className="bg-surface text-ink flex w-full items-center justify-between rounded-2xl p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]"
                    >
                        <span className="flex items-center gap-3 font-semibold">
                            <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect
                                    x="3"
                                    y="4"
                                    width="18"
                                    height="16"
                                    rx="2"
                                />
                                <circle cx="9" cy="10" r="2" />
                                <path d="M5.5 17a3.6 3.6 0 0 1 7 0" />
                                <path d="M15 9.5h3.5" />
                                <path d="M15 13.5h3.5" />
                            </svg>
                            Важные контакты
                        </span>
                        <span className="text-muted text-2xl">›</span>
                    </button>
                </div>
            )}
        </div>
    );
};
export default CitiesPage;
