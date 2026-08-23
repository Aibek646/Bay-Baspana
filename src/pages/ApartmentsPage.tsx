import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Apartment, City } from '../types.ts';
import { useAuth } from '../useAuth.ts';
import { apartmentKeys } from '../queryKey.ts';
import BackButton from '../components/BackButton.tsx';

const formatPrice = (n: number) => n.toLocaleString('ru-RU') + ' ₸';

const ApartmentsPage = () => {
    const { cityId } = useParams();
    const navigate = useNavigate();

    const { isStaff, loading: authLoading } = useAuth();

    const table = isStaff ? 'apartments' : 'apartments_public';

    const cityQuery = useQuery({
        queryKey: ['city', cityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('cities')
                .select('*')
                .eq('id', cityId)
                .maybeSingle();

            if (error) throw error;
            return data as City | null;
        },
    });

    const apartmentsQuery = useQuery({
        queryKey: apartmentKeys.list(table, cityId),
        enabled: !authLoading,
        queryFn: async () => {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('cityId', cityId);

            if (error) throw error;
            return data as Apartment[];
        },
    });

    if (authLoading || cityQuery.isLoading || apartmentsQuery.isLoading) {
        return (
            <div className="pt-safe min-h-screen bg-gray-100 p-5 text-gray-400">
                Загрузка…
            </div>
        );
    }

    if (cityQuery.isError || apartmentsQuery.isError) {
        return (
            <div className="pt-safe min-h-screen bg-gray-100 p-5 text-gray-500">
                Не удалось загрузить данные. Проверьте интернет.
            </div>
        );
    }

    const city = cityQuery.data;
    const list = apartmentsQuery.data ?? [];

    // ↓ разметка без изменений

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="pt-safe px-5 pb-4">
                <div className="mb-3">
                    <BackButton to="/" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                    {city?.name}
                </h1>
                <p className="mt-1 text-gray-500">{list.length} объектов</p>
            </header>

            <div className="space-y-3 px-5">
                {list.map((apt) => (
                    <div
                        key={apt.id}
                        onClick={() => navigate(`/apartment/${apt.id}`)}
                        className="flex cursor-pointer gap-4 rounded-2xl bg-white p-4 shadow-[0_4px_14px_rgba(0,0,0,0.10)] transition-all duration-200 active:opacity-70 active:shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                    >
                        {/* Миниатюра */}
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-200">
                            {apt.photos.length > 0 ? (
                                <img
                                    src={apt.photos[0]}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-3xl">
                                    🏠
                                </div>
                            )}
                        </div>

                        {/* Инфо */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <div className="font-semibold text-gray-900">
                                    {apt.address}
                                </div>
                                {apt.isSold ? (
                                    <span className="shrink-0 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600">
                                        Продано
                                    </span>
                                ) : (
                                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                        В продаже
                                    </span>
                                )}
                            </div>
                            <div className="mt-1 text-lg font-bold text-gray-900">
                                {formatPrice(apt.price)}
                            </div>

                            {/* Хозяин виден только админу */}
                            {isStaff && (
                                <div className="mt-0.5 text-sm text-gray-500">
                                    Хозяин: {apt.ownerName}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Кнопка добавления — только для админа */}
            {isStaff && (
                <button
                    onClick={() => navigate(`/city/${cityId}/add`)}
                    className="bottom-safe fixed right-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-3xl text-white shadow-lg transition-opacity active:opacity-80"
                >
                    +
                </button>
            )}
        </div>
    );
};

export default ApartmentsPage;
