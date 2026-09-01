import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import BackButton from '../components/BackButton.tsx';
import { RowsSkeleton } from '../components/Skeleton.tsx';
import { supabase } from '../supabase.ts';
import { useAuth } from '../useAuth.ts';
import { accessKeys } from '../queryKey.ts';
import { humanError } from '../errors.ts';
import { SUBSCRIPTION_MONTHS } from '../config.ts';
import type { AccessRequest } from '../types.ts';
import { isActiveUntil } from '../dates.ts';

type Subscriber = {
    id: string;
    email?: string;
    role: string;
    paidUntil?: string;
};

const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('ru-RU') : '—';

const formatMoment = (iso: string) =>
    new Date(iso).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    });

const SubscriptionsPage = () => {
    const queryClient = useQueryClient();
    const { isAdmin, isStaff, loading: authLoading } = useAuth();

    const pendingQuery = useQuery({
        queryKey: accessKeys.pending(),
        enabled: !authLoading && isStaff,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('access_requests')
                .select('*, profiles(email, paidUntil)')
                .eq('status', 'pending')
                .order('createdAt');

            if (error) throw error;
            return data as AccessRequest[];
        },
    });

    const subscribersQuery = useQuery({
        queryKey: accessKeys.subscribers(),
        enabled: !authLoading && isStaff,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, role, paidUntil')
                .not('paidUntil', 'is', null)
                .order('paidUntil', { ascending: false });

            if (error) throw error;
            return data as Subscriber[];
        },
    });

    const decide = useMutation({
        mutationFn: async ({
            id,
            approve,
        }: {
            id: string;
            approve: boolean;
        }) => {
            const { error } = approve
                ? await supabase.rpc('approve_access', {
                      request_id: id,
                      months: SUBSCRIPTION_MONTHS,
                  })
                : await supabase.rpc('reject_access', { request_id: id });

            if (error) throw error;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: accessKeys.all });
        },
    });

    if (authLoading || pendingQuery.isLoading) {
        return (
            <div className="bg-ground min-h-screen">
                <div className="pt-safe px-5 pb-4">
                    <div className="bg-line h-8 w-40 animate-pulse rounded" />
                </div>
                <RowsSkeleton />
            </div>
        );
    }

    if (!isStaff) {
        return (
            <div className="pt-safe bg-ground text-muted min-h-screen p-5">
                Нет доступа
            </div>
        );
    }

    const pending = pendingQuery.data ?? [];
    const subscribers = subscribersQuery.data ?? [];

    return (
        <div className="bg-ground min-h-screen pb-10">
            <header className="pt-safe px-5 pb-4">
                <div className="flex items-center gap-3">
                    <BackButton to="/" />
                    <h1 className="text-ink text-2xl font-bold">Подписки</h1>
                </div>
            </header>

            <div className="space-y-3 px-5">
                <h2 className="text-muted text-xs font-semibold tracking-wide uppercase">
                    Заявки {pending.length > 0 && `· ${pending.length}`}
                </h2>

                {pending.length === 0 && (
                    <p className="text-muted text-sm">Новых заявок нет</p>
                )}

                {decide.isError && (
                    <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                        {humanError(decide.error)}
                    </p>
                )}

                {pending.map((request) => (
                    <div
                        key={request.id}
                        className="bg-surface rounded-2xl p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]"
                    >
                        <div className="text-ink font-semibold">
                            {request.profiles?.email ?? 'без почты'}
                        </div>
                        <div className="text-muted mt-1 text-sm">
                            Код {request.code}
                            {request.payerName &&
                                ` · плательщик «${request.payerName}»`}
                        </div>
                        <div className="text-muted text-sm">
                            {formatMoment(request.createdAt)}
                        </div>

                        {isAdmin ? (
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() =>
                                        decide.mutate({
                                            id: request.id,
                                            approve: true,
                                        })
                                    }
                                    disabled={decide.isPending}
                                    className="btn-accent flex-1 rounded-xl py-2.5 font-medium disabled:opacity-50"
                                >
                                    Открыть на год
                                </button>
                                <button
                                    onClick={() =>
                                        decide.mutate({
                                            id: request.id,
                                            approve: false,
                                        })
                                    }
                                    disabled={decide.isPending}
                                    className="border-line bg-ground flex-1 rounded-xl border py-2.5 font-medium text-red-600 disabled:opacity-50 dark:text-red-400"
                                >
                                    Отклонить
                                </button>
                            </div>
                        ) : (
                            <p className="text-muted mt-3 text-sm">
                                Открыть доступ может только владелец
                            </p>
                        )}
                    </div>
                ))}

                <h2 className="text-muted mt-6 text-xs font-semibold tracking-wide uppercase">
                    Подписчики · {subscribers.length}
                </h2>

                {subscribers.map((person) => {
                    const active = isActiveUntil(person.paidUntil);

                    return (
                        <div
                            key={person.id}
                            className="bg-surface flex items-center justify-between gap-3 rounded-2xl p-4 shadow-[0_4px_14px_rgba(0,0,0,0.10)]"
                        >
                            <div className="min-w-0">
                                <div className="text-ink truncate text-sm font-medium">
                                    {person.email ?? person.id}
                                </div>
                                <div className="text-muted text-sm">
                                    до {formatDate(person.paidUntil)}
                                </div>
                            </div>

                            <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                                    active
                                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                        : 'bg-line text-muted'
                                }`}
                            >
                                {active ? 'активна' : 'истекла'}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubscriptionsPage;
