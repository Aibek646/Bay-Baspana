import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Apartment } from '../types.ts';
import { useAuth } from '../useAuth.ts';
import { apartmentKeys } from '../queryKey.ts';
import BackButton from '../components/BackButton.tsx';
import { DetailSkeleton } from '../components/Skeleton.tsx';
import {
    formatArea,
    formatLandArea,
    formatPrice,
    formatRooms,
} from '../format.ts';
import {
    propertyTypeChip,
    propertyTypeEmoji,
    propertyTypeLabel,
} from '../property.ts';
import { isNew } from '../dates.ts';

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

    // свайп по фото вверх или вниз закрывает полноэкранный просмотр
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const [dragY, setDragY] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStart.current) return;

        const touch = e.touches[0];
        const dx = touch.clientX - touchStart.current.x;
        const dy = touch.clientY - touchStart.current.y;

        // горизонтальный жест — это листание фото, не мешаем ему
        if (Math.abs(dx) > Math.abs(dy)) return;

        setDragY(dy);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const start = touchStart.current;
        const touch = e.changedTouches[0];

        // расстояние берём из события, а не из dragY: при быстром движении
        // состояние может не успеть обновиться до touchend
        if (start && touch) {
            const dx = touch.clientX - start.x;
            const dy = touch.clientY - start.y;

            if (Math.abs(dy) > 100 && Math.abs(dy) > Math.abs(dx)) {
                setFullScreen(false);
            }
        }

        setDragY(0);
        touchStart.current = null;
    };

    useEffect(() => {
        if (fullscreen && fullRef.current) {
            fullRef.current.scrollLeft =
                activePhoto * fullRef.current.clientWidth;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullscreen]);

    if (authLoading || aptQuery.isLoading) {
        return (
            <div className="bg-ground min-h-screen">
                <DetailSkeleton />
            </div>
        );
    }

    const apt = aptQuery.data;

    if (aptQuery.isError || !apt) {
        return (
            <div className="pt-safe bg-ground min-h-screen p-5">
                <BackButton to="/" />
                <p className="text-muted mt-4">
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
    if (apt.landArea != null) {
        specs.push({ label: 'Участок', value: formatLandArea(apt.landArea) });
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
        <div className="bg-ground min-h-screen pb-10">
            {/* Фото */}
            <div className="bg-line relative aspect-[4/3]">
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
                    <div className="text-muted flex h-full w-full flex-col items-center justify-center gap-2">
                        <span className="text-5xl">
                            {propertyTypeEmoji[apt.propertyType]}
                        </span>
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
                                            ? 'bg-surface w-4'
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
                <div className="mt-5 flex flex-wrap items-center gap-2">
                    {apt.isSold ? (
                        <span className="bg-line text-muted rounded-full px-3 py-1 text-sm font-medium">
                            Продано
                        </span>
                    ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                            В продаже
                        </span>
                    )}

                    {isNew(apt.createdAt) && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Новое
                        </span>
                    )}

                    <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${propertyTypeChip[apt.propertyType]}`}
                    >
                        {propertyTypeLabel(apt.propertyType)}
                    </span>
                </div>

                <h1 className="text-ink mt-3 text-2xl font-bold">
                    {apt.address}
                </h1>
                <div className="text-ink mt-1 text-xl font-bold">
                    {formatPrice(apt.price)}
                </div>

                {/* Видео — главный способ посмотреть объект, поэтому сразу
                    под ценой и чёрной кнопкой, в тон TikTok */}
                {apt.videoUrl && (
                    <a
                        href={apt.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="press mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3.5 font-semibold text-white shadow-[0_6px_18px_rgba(0,0,0,0.25)] active:opacity-90 dark:bg-white dark:text-gray-900"
                    >
                        ▶ Смотреть видео
                    </a>
                )}

                {/* Характеристики */}
                {specs.length > 0 && (
                    <div className="bg-surface mt-4 rounded-2xl p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                        {specs.map((spec, index) => (
                            <div
                                key={spec.label}
                                className={`flex items-center justify-between py-2 ${
                                    index > 0 ? 'border-line-soft border-t' : ''
                                }`}
                            >
                                <span className="text-muted">{spec.label}</span>
                                <span className="text-ink font-medium">
                                    {spec.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-surface mt-4 rounded-2xl p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                    {apt.dealType === 'cash' ? (
                        <div className="flex items-center justify-between">
                            <span className="text-muted">Оплата</span>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                Наличными
                            </span>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-muted">Оплата</span>
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                    Рассрочка
                                </span>
                            </div>
                            <div className="border-line-soft flex items-center justify-between border-t py-2">
                                <span className="text-muted">
                                    Первоначальный взнос
                                </span>
                                <span className="text-ink font-medium">
                                    {formatPrice(apt.downPayment ?? 0)}
                                </span>
                            </div>
                            <div className="border-line-soft flex items-center justify-between border-t py-2">
                                <span className="text-muted">Срок</span>
                                <span className="text-ink font-medium">
                                    {apt.installmentMonths} мес.
                                </span>
                            </div>
                            <div className="border-line-soft flex items-center justify-between border-t py-2">
                                <span className="text-muted">
                                    Ежемесячный платёж
                                </span>
                                <span className="text-ink font-medium">
                                    {formatPrice(apt.monthlyPayment ?? 0)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {isStaff && (
                    <>
                        {/* Хозяин + WhatsApp */}
                        <div className="bg-surface mt-4 rounded-2xl p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                            <div className="text-muted text-sm">Хозяин</div>
                            <div className="text-ink text-lg font-semibold">
                                {apt.ownerName}
                            </div>
                            <div className="text-muted mt-1">
                                {apt.whatsapp}
                            </div>
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="press mt-4 flex items-center justify-center rounded-xl bg-green-500 py-3 font-semibold text-white active:opacity-80"
                            >
                                Написать в WhatsApp
                            </a>
                        </div>

                        {apt.complex && (
                            <div className="bg-surface mt-4 rounded-2xl p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted">🔒 ЖК</span>
                                    <span className="text-ink font-medium">
                                        {apt.complex}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Точный адрес: две карты, кнопки делят строку */}
                        {(apt.mapUrl || apt.yandexUrl) && (
                            <div className="mt-4 flex gap-2">
                                {apt.mapUrl && (
                                    <a
                                        href={apt.mapUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="press bg-surface flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-blue-600 shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:opacity-70 dark:text-blue-400"
                                    >
                                        📍 2ГИС
                                    </a>
                                )}

                                {apt.yandexUrl && (
                                    <a
                                        href={apt.yandexUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="press bg-surface flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-blue-600 shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:opacity-70 dark:text-blue-400"
                                    >
                                        📍 Яндекс
                                    </a>
                                )}
                            </div>
                        )}
                        <button
                            onClick={() =>
                                navigate(`/apartment/${apt.id}/edit`)
                            }
                            className="mt-4 w-full rounded-2xl bg-blue-500 py-3 font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.10)] transition-all duration-200 active:opacity-80 active:shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                        >
                            Изменить
                        </button>

                        <div className="bg-surface mt-4 rounded-2xl p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                            <div className="text-muted text-sm">
                                Комментарий
                            </div>
                            <div className="text-ink mt-1">
                                {apt.comment || 'Нет комментария'}
                            </div>
                        </div>
                    </>
                )}
            </div>
            {/* Полноэкранный просмотр */}
            {fullscreen && (
                <div
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{
                        opacity: Math.max(0.3, 1 - Math.abs(dragY) / 400),
                    }}
                    className="fixed inset-0 z-50 bg-black"
                >
                    <div
                        ref={fullRef}
                        style={{
                            transform: `translateY(${dragY}px)`,
                            transition: dragY === 0 ? 'transform 0.2s' : 'none',
                        }}
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
