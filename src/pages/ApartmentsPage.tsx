import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Apartment, City } from '../types.ts';
import { useAuth } from '../useAuth.ts';
import { apartmentKeys } from '../queryKey.ts';
import BackButton from '../components/BackButton.tsx';
import {
    formatArea,
    formatLandArea,
    formatObjects,
    formatPrice,
    formatRoomsShort,
} from '../format.ts';
import {
    propertyTypeChip,
    propertyTypeEmoji,
    propertyTypeLabel,
} from '../property.ts';
import { isNew } from '../dates.ts';
import ApartmentFilters from '../components/ApartmentFilters.tsx';
import { applyFilters, emptyFilters, type Filters } from '../filters.ts';

const ApartmentsPage = () => {
    const { cityId } = useParams();
    const navigate = useNavigate();

    const { isStaff, loading: authLoading } = useAuth();

    const [filters, setFilters] = useState<Filters>(emptyFilters);

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
    const visible = applyFilters(list, filters);

    // ↓ разметка без изменений

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Шапка липкая целиком: так безопасная зона учитывается один раз,
                и под вырезом не просвечивает уезжающий список */}
            <header className="pt-safe sticky top-0 z-20 space-y-3 bg-gray-100 px-5 pb-3">
                <div className="flex items-center gap-3">
                    <BackButton to="/" />
                    <h1 className="text-2xl font-bold text-gray-900">
                        {city?.name}
                    </h1>
                </div>

                <ApartmentFilters value={filters} onChange={setFilters} />

                <p className="text-sm text-gray-500">
                    {visible.length === list.length
                        ? formatObjects(list.length)
                        : `Найдено ${formatObjects(visible.length)} из ${list.length}`}
                </p>
            </header>

            <div className="space-y-3 px-5">
                {visible.map((apt) => {
                    // «Дом · 4 комн. · 180 м² · 6 соток · 2 эт.»
                    const parts: string[] = [];

                    if (apt.rooms != null) {
                        parts.push(formatRoomsShort(apt.rooms));
                    }
                    if (apt.area != null) {
                        parts.push(formatArea(apt.area));
                    }
                    if (apt.landArea != null) {
                        parts.push(formatLandArea(apt.landArea));
                    }
                    if (apt.floor != null) {
                        parts.push(
                            `${apt.floor}${
                                apt.floorsTotal != null
                                    ? '/' + apt.floorsTotal
                                    : ''
                            } эт.`
                        );
                    } else if (
                        apt.propertyType === 'house' &&
                        apt.floorsTotal != null
                    ) {
                        // у дома нет «этажа», но этажность сама по себе полезна
                        parts.push(`${apt.floorsTotal} эт.`);
                    }

                    const specsLine = parts.join(' · ');

                    return (
                        <div
                            key={apt.id}
                            onClick={() => navigate(`/apartment/${apt.id}`)}
                            className="flex cursor-pointer gap-4 rounded-2xl bg-white p-4 shadow-[0_4px_14px_rgba(0,0,0,0.10)] transition-all duration-200 active:opacity-70 active:shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                        >
                            {/* Миниатюра */}
                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-200">
                                {apt.photos.length > 0 ? (
                                    <img
                                        src={apt.photos[0]}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-3xl">
                                        {propertyTypeEmoji[apt.propertyType]}
                                    </div>
                                )}

                                {isNew(apt.createdAt) && (
                                    <span className="absolute top-1 left-1 rounded-full bg-amber-400 px-1.5 text-[9px] leading-4 font-semibold text-amber-950 shadow">
                                        Новое
                                    </span>
                                )}
                            </div>

                            {/* Инфо */}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="font-semibold text-gray-900">
                                        {apt.address}
                                    </div>
                                    {/* «В продаже» не рисуем: это состояние
                                        по умолчанию, бейдж на каждой карточке
                                        превращается в шум */}
                                    {apt.isSold && (
                                        <span className="shrink-0 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600">
                                            Продано
                                        </span>
                                    )}
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${propertyTypeChip[apt.propertyType]}`}
                                    >
                                        {propertyTypeLabel(apt.propertyType)}
                                    </span>

                                    {specsLine && (
                                        <span className="text-sm text-gray-500">
                                            {specsLine}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-1 text-lg font-bold text-gray-900">
                                    {formatPrice(apt.price)}
                                </div>

                                {apt.dealType === 'installment' &&
                                    apt.monthlyPayment != null && (
                                        <div className="text-sm text-gray-500">
                                            Рассрочка ·{' '}
                                            {formatPrice(apt.monthlyPayment)}
                                            /мес
                                        </div>
                                    )}

                                {/* Хозяин виден только сотрудникам */}
                                {isStaff && (
                                    <div className="mt-0.5 text-sm text-gray-500">
                                        Хозяин: {apt.ownerName}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {visible.length === 0 && list.length > 0 && (
                    <div className="rounded-2xl bg-white p-6 text-center shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                        <p className="text-gray-500">
                            Ничего не найдено под эти фильтры
                        </p>
                        <button
                            type="button"
                            onClick={() => setFilters(emptyFilters)}
                            className="mt-3 font-medium text-blue-600 active:opacity-70"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                )}
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
