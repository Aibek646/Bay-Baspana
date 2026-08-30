import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Apartment } from '../types.ts';
import { useAuth } from '../useAuth.ts';
import { apartmentKeys } from '../queryKey.ts';
import BackButton from '../components/BackButton.tsx';
import { formatArea, formatPrice, formatRooms } from '../format.ts';

const ApartmentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { isStaff, loading: authLoading } = useAuth();

    const table = isStaff ? 'apartments' : 'apartments_public';

    const aptQuery = useQuery({
        queryKey: apartmentKeys.detail(table, id),
        enabled: !authLoading,
        queryFn: async () => {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (error) throw error;
            return data as Apartment | null;
        },
    });

    const [activePhoto, setActivePhoto] = useState(0);
    const [fullscreen, setFullScreen] = useState(false);
    const fullRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (fullscreen && fullRef.current) {
            fullRef.current.scrollLeft =
                activePhoto * fullRef.current.clientWidth;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullscreen]);

    if (authLoading || aptQuery.isLoading) {
        return (
            <div className="pt-safe min-h-screen bg-gray-100 p-5 text-gray-400">
                Загрузка…
            </div>
        );
    }

    const apt = aptQuery.data;

    if (aptQuery.isError || !apt) {
        return (
            <div className="pt-safe min-h-screen bg-gray-100 p-5">
                <BackButton to="/" />
                <p className="mt-4 text-gray-500">
                    {aptQuery.isError
                        ? 'Не удалось загрузить квартиру'
                        : 'Квартира не найдена'}
                </p>
            </div>
        );
    }

    const waNumber = apt.whatsapp?.replace(/\D/g, '') ?? '';
    const waLink = `https://wa.me/${waNumber}`;

    type Spec = { label: string; value: string };

    const specs: Spec[] = [];

    if (apt.rooms != null) {
        specs.push({ label: 'Комнат', value: formatRooms(apt.rooms) });
    }
    if (apt.area != null) {
        specs.push({ label: 'Площадь', value: formatArea(apt.area) });
    }
    if (apt.floor != null) {
        specs.push({
            label: 'Этаж',
            value:
                apt.floorsTotal != null
                    ? `${apt.floor} из ${apt.floorsTotal}`
                    : String(apt.floor),
        });
    }
    if (apt.builtYear != null) {
        specs.push({ label: 'Год постройки', value: String(apt.builtYear) });
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-10">
            {/* Фото */}
            <div className="relative h-72 bg-gray-300">
                {apt.photos.length > 0 ? (
                    <div
                        onClick={() => setFullScreen(true)}
                        onScroll={(e) => {
                            const el = e.currentTarget;
                            setActivePhoto(
                                Math.round(el.scrollLeft / el.clientWidth)
                            );
                        }}
                        className="no-scrollbar flex h-full cursor-pointer snap-x snap-mandatory overflow-x-auto"
                    >
                        {apt.photos.map((url) => (
                            <img
                                key={url}
                                src={url}
                                alt=""
                                className="h-full w-full shrink-0 snap-center object-cover"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-500">
                        Нет фото
                    </div>
                )}

                {/* Кнопка назад */}
                <div className="top-safe absolute left-4 z-10">
                    <BackButton to={`/city/${apt.cityId}`} variant="overlay" />
                </div>

                {/* Счётчик и точки — только если фото больше одного */}
                {apt.photos.length > 1 && (
                    <>
                        <div className="top-safe absolute right-4 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                            {activePhoto + 1} / {apt.photos.length}
                        </div>

                        <div className="absolute right-0 bottom-3 left-0 flex justify-center gap-1.5">
                            {apt.photos.map((url, index) => (
                                <span
                                    key={url}
                                    className={`h-1.5 rounded-full transition-all duration-200 ${
                                        index === activePhoto
                                            ? 'w-4 bg-white'
                                            : 'w-1.5 bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="px-5">
                {/* Статус */}
                <div className="mt-5">
                    {apt.isSold ? (
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-600">
                            Продано
                        </span>
                    ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                            В продаже
                        </span>
                    )}
                </div>

                <h1 className="mt-3 text-2xl font-bold text-gray-900">
                    {apt.address}
                </h1>
                <div className="mt-1 text-xl font-bold text-gray-900">
                    {formatPrice(apt.price)}
                </div>

                {/* Характеристики */}
                {specs.length > 0 && (
                    <div className="mt-4 rounded-2xl bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                        {specs.map((spec, index) => (
                            <div
                                key={spec.label}
                                className={`flex items-center justify-between py-2 ${
                                    index > 0 ? 'border-t border-gray-100' : ''
                                }`}
                            >
                                <span className="text-gray-500">
                                    {spec.label}
                                </span>
                                <span className="font-medium text-gray-900">
                                    {spec.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-4 rounded-2xl bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                    {apt.dealType === 'cash' ? (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Оплата</span>
                            <span className="font-semibold text-gray-900">
                                Наличными
                            </span>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-gray-500">Оплата</span>
                                <span className="font-semibold text-blue-600">
                                    Рассрочка
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-100 py-2">
                                <span className="text-gray-500">
                                    Первоначальный взнос
                                </span>
                                <span className="font-medium text-gray-900">
                                    {formatPrice(apt.downPayment ?? 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-100 py-2">
                                <span className="text-gray-500">Срок</span>
                                <span className="font-medium text-gray-900">
                                    {apt.installmentMonths} мес.
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-100 py-2">
                                <span className="text-gray-500">
                                    Ежемесячный платёж
                                </span>
                                <span className="font-medium text-gray-900">
                                    {formatPrice(apt.monthlyPayment ?? 0)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Хозяин + WhatsApp */}

                {isStaff && (
                    <>
                        {/* Хозяин + WhatsApp */}
                        <div className="mt-4 rounded-2xl bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                            <div className="text-sm text-gray-500">Хозяин</div>
                            <div className="text-lg font-semibold text-gray-900">
                                {apt.ownerName}
                            </div>
                            <div className="mt-1 text-gray-600">
                                {apt.whatsapp}
                            </div>
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 flex items-center justify-center rounded-xl bg-green-500 py-3 font-semibold text-white transition-opacity active:opacity-80"
                            >
                                Написать в WhatsApp
                            </a>
                        </div>

                        {/* Точный адрес на карте */}
                        {apt.mapUrl && (
                            <a
                                href={apt.mapUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-white py-3 font-semibold text-blue-600 shadow-[0_4px_14px_rgba(0,0,0,0.10)] transition-opacity active:opacity-70"
                            >
                                📍 Посмотреть на карте
                            </a>
                        )}
                        <button
                            onClick={() =>
                                navigate(`/apartment/${apt.id}/edit`)
                            }
                            className="mt-4 w-full rounded-2xl bg-blue-500 py-3 font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.10)] transition-all duration-200 active:opacity-80 active:shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                        >
                            Изменить
                        </button>

                        {/* Комментарий */}

                        {apt.complex && (
                            <div className="mt-4 rounded-2xl bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">🔒 ЖК</span>
                                    <span className="font-medium text-gray-900">
                                        {apt.complex}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="mt-4 rounded-2xl bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                            <div className="text-sm text-gray-500">
                                Комментарий
                            </div>
                            <div className="mt-1 text-gray-800">
                                {apt.comment || 'Нет комментария'}
                            </div>
                        </div>
                    </>
                )}

                {apt.videoUrl && (
                    <a
                        href={apt.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-white py-3 font-semibold text-gray-900 shadow-[0_4px_14px_rgba(0,0,0,0.10)] transition-opacity active:opacity-70"
                    >
                        🎬 Смотреть видео
                    </a>
                )}

                {/* Комментарий */}
            </div>
            {/* Полноэкранный просмотр */}
            {fullscreen && (
                <div className="fixed inset-0 z-50 bg-black">
                    <div
                        ref={fullRef}
                        onScroll={(e) => {
                            const el = e.currentTarget;
                            setActivePhoto(
                                Math.round(el.scrollLeft / el.clientWidth)
                            );
                        }}
                        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto"
                    >
                        {apt.photos.map((url) => (
                            <div
                                key={url}
                                className="flex h-full w-full shrink-0 snap-center items-center justify-center"
                            >
                                <img
                                    src={url}
                                    alt=""
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setFullScreen(false)}
                        className="top-safe absolute right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/20 text-2xl text-white backdrop-blur active:opacity-70"
                    >
                        ×
                    </button>

                    {apt.photos.length > 1 && (
                        <div className="top-safe absolute left-4 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur">
                            {activePhoto + 1} / {apt.photos.length}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ApartmentDetailPage;
