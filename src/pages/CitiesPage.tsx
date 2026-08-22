import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Apartment, City } from '../types.ts';
import { supabase } from '../supabase.ts';
import { useAuth } from '../useAuth.ts';

const CitiesPage = () => {
    const navigate = useNavigate();

    const { session, isStaff, loading: authLoading } = useAuth();

    const table = isStaff ? 'apartments' : 'apartments_public';

    const citiesQuery = useQuery({
        queryKey: ['cities'],
        queryFn: async () => {
            const { data, error } = await supabase.from('cities').select('*');
            if (error) throw error;
            return data as City[];
        },
    });

    const apartmentsQuery = useQuery({
        queryKey: ['apartments', table],
        enabled: !authLoading,
        queryFn: async () => {
            const { data, error } = await supabase.from(table).select('*');
            if (error) throw error;
            return data as Apartment[];
        },
    });

    if (authLoading || citiesQuery.isLoading || apartmentsQuery.isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 p-5 pt-14 text-gray-400">
                Загрузка…
            </div>
        );
    }

    if (citiesQuery.isError || apartmentsQuery.isError) {
        return (
            <div className="min-h-screen bg-gray-100 p-5 pt-14 text-gray-500">
                Не удалось загрузить данные. Проверьте интернет.
            </div>
        );
    }

    const cities = citiesQuery.data ?? [];
    const apartments = apartmentsQuery.data ?? [];

    // ↓ дальше разметка без изменений

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="px-5 pt-14 pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            BAY BASPANA
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
                    const count = apartments.filter(
                        (a) => a.cityId === city.id
                    ).length;
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
