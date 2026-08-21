import { useNavigate } from 'react-router-dom';
import type { Apartment, City } from '../types.ts';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase.ts';
import { useAuth } from '../useAuth.ts';

const CitiesPage = () => {
    const navigate = useNavigate();

    const [cities, setCities] = useState<City[]>([]);
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);

    const { session, isStaff, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return; // ждём, пока проверится сессия

        const load = async () => {
            const table = isStaff ? 'apartments' : 'apartments_public';

            const { data: citiesData } = await supabase
                .from('cities')
                .select('*');
            const { data: aptData } = await supabase.from(table).select('*');

            setCities(citiesData ?? []);
            setApartments(aptData ?? []);
            setLoading(false);
        };

        load();
    }, [isStaff, authLoading]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-5 pt-14 text-gray-400">
                Загрузка…
            </div>
        );
    }

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
