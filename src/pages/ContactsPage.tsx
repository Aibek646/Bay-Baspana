import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton.tsx';
import { PinIcon } from '../components/icons.tsx';
import { RowsSkeleton } from '../components/Skeleton.tsx';
import { supabase } from '../supabase.ts';
import type { Contact } from '../types.ts';
import { useAuth } from '../useAuth.ts';
import { contactKeys } from '../queryKey.ts';

const ContactsPage = () => {
    const navigate = useNavigate();
    const { isStaff, loading: authLoading } = useAuth();

    const contactsQuery = useQuery({
        queryKey: contactKeys.list(),
        enabled: !authLoading && isStaff,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .order('name');

            if (error) throw error;
            return data as Contact[];
        },
    });

    if (authLoading || contactsQuery.isLoading) {
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

    const list = contactsQuery.data ?? [];

    return (
        <div className="bg-ground min-h-screen pb-28">
            <header className="pt-safe px-5 pb-4">
                <div className="flex items-center gap-3">
                    <BackButton to="/" />
                    <h1 className="text-ink text-2xl font-bold">
                        Важные контакты
                    </h1>
                </div>
            </header>

            <div className="space-y-3 px-5">
                {contactsQuery.isError && (
                    <p className="text-muted">
                        Не удалось загрузить. Проверьте интернет.
                    </p>
                )}

                {list.map((contact) => {
                    const digits = contact.phone?.replace(/\D/g, '') ?? '';

                    return (
                        <div
                            key={contact.id}
                            className="bg-surface rounded-2xl p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-ink font-semibold">
                                        {contact.name}
                                    </div>
                                    {contact.role && (
                                        <div className="text-muted text-sm">
                                            {contact.role}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() =>
                                        navigate(`/contacts/${contact.id}/edit`)
                                    }
                                    className="text-sm font-medium text-blue-600 dark:text-blue-400"
                                >
                                    Изменить
                                </button>
                            </div>

                            {contact.address && (
                                <div className="text-muted mt-2 text-sm">
                                    {contact.address}
                                </div>
                            )}

                            {contact.comment && (
                                <div className="text-ink mt-2 text-sm">
                                    {contact.comment}
                                </div>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                                {digits && (
                                    <>
                                        <a
                                            href={`tel:+${digits}`}
                                            className="press bg-ground text-ink flex-1 rounded-xl py-2.5 text-center font-medium"
                                        >
                                            Позвонить
                                        </a>
                                        <a
                                            href={`https://wa.me/${digits}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="press flex-1 rounded-xl bg-green-500 py-2.5 text-center font-medium text-white"
                                        >
                                            WhatsApp
                                        </a>
                                    </>
                                )}

                                {contact.mapUrl && (
                                    <a
                                        href={contact.mapUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="press bg-ground flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 font-medium text-blue-600 dark:text-blue-400"
                                    >
                                        <PinIcon />
                                        На карте
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}

                {list.length === 0 && !contactsQuery.isError && (
                    <div className="bg-surface rounded-2xl p-6 text-center shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                        <p className="text-muted">Пока никого нет</p>
                        <button
                            onClick={() => navigate('/contacts/new')}
                            className="mt-3 font-medium text-blue-600 active:opacity-70 dark:text-blue-400"
                        >
                            Добавить первого
                        </button>
                    </div>
                )}
            </div>

            <button
                onClick={() => navigate('/contacts/new')}
                aria-label="Добавить контакт"
                className="btn-accent bottom-safe animate-pop fixed right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full text-3xl"
            >
                +
            </button>
        </div>
    );
};

export default ContactsPage;
