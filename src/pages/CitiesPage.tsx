import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { City } from '../types.ts';
import { supabase } from '../supabase.ts';
import { useAuth } from '../useAuth.ts';
import { apartmentKeys } from '../queryKey.ts';

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
            <div className="pt-safe min-h-screen bg-gray-100 p-5 text-gray-400">
                Загрузка…
            </div>
        );
    }

    if (citiesQuery.isError || countsQuery.isError) {
        return (
            <div className="pt-safe min-h-screen bg-gray-100 p-5 text-gray-500">
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
        <div className="min-h-screen bg-gray-100">
            <header className="pt-safe px-5 pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1
                            onClick={handleTitleTap}
                            className="text-3xl font-bold text-gray-900"
                        >
                            SABIT BASPANA
                        </h1>
                        <p className="mt-1 text-gray-500">
                            Объекты недвижимости
                        </p>
                        {isStaff && (
                            <span className="mt-1 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                Режим управления
                            </span>
                        )}
                    </div>
                    {session && (
                        <button
                            className="mt-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 active:opacity-70"
                            onClick={() => supabase.auth.signOut()}
                        >
                            Выйти
                        </button>
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
                            className="flex w-full cursor-pointer items-center justify-between rounded-2xl bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)] transition-all duration-200 active:opacity-70 active:shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                        >
                            <div className="text-left">
                                <div className="text-lg font-semibold text-gray-900">
                                    {city.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {count} объектов
                                </div>
                            </div>

                            <span className="text-2xl text-gray-400">›</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
export default CitiesPage;
