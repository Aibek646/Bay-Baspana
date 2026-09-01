import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase.ts';
import { useAuth } from '../useAuth.ts';
import { accessKeys } from '../queryKey.ts';
import { humanError } from '../errors.ts';
import { formatPrice } from '../format.ts';
import { accessCode, KASPI_PHONE, SUBSCRIPTION_PRICE } from '../config.ts';
import type { AccessRequest } from '../types.ts';

const SubscribePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { session, hasAccess, loading } = useAuth();

    const [payerName, setPayerName] = useState('');
    const [formOpen, setFormOpen] = useState(false);

    const userId = session?.user.id;
    const code = userId ? accessCode(userId) : '';

    const requestQuery = useQuery({
        queryKey: accessKeys.mine(userId),
        enabled: !!userId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('access_requests')
                .select('*')
                .order('createdAt', { ascending: false })
                .limit(1);

            if (error) throw error;
            return (data?.[0] ?? null) as AccessRequest | null;
        },
    });

    const sendMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from('access_requests').insert({
                userId,
                code,
                payerName: payerName.trim() || null,
            });

            if (error) throw error;
        },
        onSuccess: async () => {
            setFormOpen(false);
            await queryClient.invalidateQueries({ queryKey: accessKeys.all });
        },
    });

    if (loading) {
        return (
            <div className="pt-safe bg-ground text-muted min-h-screen p-5">
                Загрузка…
            </div>
        );
    }

    if (!session) return <Navigate to="/login" replace />;

    // доступ уже есть — незачем держать на этом экране
    if (hasAccess) {
        return (
            <div className="pt-safe bg-ground min-h-screen px-5">
                <h1 className="text-ink mt-4 text-2xl font-bold">
                    Подписка активна
                </h1>
                <button
                    onClick={() => navigate('/')}
                    className="btn-accent mt-6 w-full rounded-xl py-3 font-semibold"
                >
                    К объектам
                </button>
            </div>
        );
    }

    const request = requestQuery.data;
    const waiting = request?.status === 'pending';
    const rejected = request?.status === 'rejected';

    const whatsapp = `https://wa.me/${KASPI_PHONE.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Подписка BAY BASPANA, код ${code}`
    )}`;

    return (
        <div className="pt-safe bg-ground min-h-screen px-5 pb-10">
            <h1 className="text-ink mt-4 text-2xl font-bold">
                Каталог по подписке
            </h1>
            <p className="text-muted mt-1">{session.user.email}</p>

            <div className="bg-surface mt-5 rounded-2xl p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                <div className="text-muted text-sm">Доступ на год</div>
                <div className="price text-ink mt-1 text-3xl font-extrabold">
                    {formatPrice(SUBSCRIPTION_PRICE)}
                </div>

                <div className="border-line-soft mt-4 space-y-3 border-t pt-4">
                    <div>
                        <div className="text-muted text-sm">
                            Перевести на Kaspi
                        </div>
                        <div className="text-ink text-lg font-semibold">
                            {KASPI_PHONE}
                        </div>
                    </div>

                    <div>
                        <div className="text-muted text-sm">
                            Указать в комментарии к переводу
                        </div>
                        <div className="text-ink text-lg font-semibold">
                            {code}
                        </div>
                    </div>
                </div>
            </div>

            {waiting ? (
                <div className="bg-surface mt-4 rounded-2xl p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                    <p className="text-ink font-semibold">Проверяем перевод</p>
                    <p className="text-muted mt-1 text-sm">
                        Обычно открываем доступ в течение дня. Если срочно —
                        напишите нам.
                    </p>
                </div>
            ) : (
                <>
                    {rejected && (
                        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                            Перевод не нашли. Проверьте сумму и код или напишите
                            нам.
                        </p>
                    )}

                    {formOpen ? (
                        <div className="mt-4 space-y-3">
                            <input
                                value={payerName}
                                onChange={(e) => setPayerName(e.target.value)}
                                placeholder="имя, с которого перевели"
                                className="border-line bg-surface text-ink w-full rounded-xl border p-3 outline-none focus:border-blue-400"
                            />

                            {sendMutation.isError && (
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {humanError(sendMutation.error)}
                                </p>
                            )}

                            <button
                                onClick={() => sendMutation.mutate()}
                                disabled={sendMutation.isPending}
                                className="btn-accent w-full rounded-xl py-3 font-semibold disabled:opacity-50"
                            >
                                {sendMutation.isPending
                                    ? 'Отправляем…'
                                    : 'Отправить заявку'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setFormOpen(true)}
                            className="btn-accent mt-4 w-full rounded-xl py-3 font-semibold"
                        >
                            Я оплатил
                        </button>
                    )}
                </>
            )}

            <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="press mt-3 block rounded-xl bg-green-500 py-3 text-center font-semibold text-white"
            >
                Написать в WhatsApp
            </a>

            <button
                onClick={() => supabase.auth.signOut()}
                className="text-muted mt-6 w-full py-2 text-sm"
            >
                Выйти
            </button>
        </div>
    );
};

export default SubscribePage;
