import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import BackButton from '../components/BackButton.tsx';
import ConfirmDialog from '../components/ConfirmDialog.tsx';
import FormControl, { type Field } from '../components/FormControl.tsx';
import { supabase } from '../supabase.ts';
import type { Contact } from '../types.ts';
import { useAuth } from '../useAuth.ts';
import { contactKeys } from '../queryKey.ts';
import { humanError } from '../errors.ts';

const fields: Field[] = [
    { name: 'name', label: 'Имя', placeholder: 'Айгуль Сериковна' },
    { name: 'role', label: 'Кто это', placeholder: 'нотариус' },
    {
        name: 'phone',
        label: 'Телефон',
        type: 'phone',
        placeholder: '+7 701 234 5678',
    },
    { name: 'address', label: 'Адрес', placeholder: 'Алматы, ул. Абая 150' },
    {
        name: 'mapUrl',
        label: 'Ссылка на карту',
        placeholder: 'https://2gis.kz/almaty/...',
    },
    {
        name: 'comment',
        label: 'Заметка',
        type: 'textarea',
        placeholder: 'работает до 18:00, суббота выходной',
    },
];

type FormState = Record<string, string | boolean>;

const empty: FormState = {
    name: '',
    role: '',
    phone: '',
    address: '',
    mapUrl: '',
    comment: '',
};

const toFormState = (contact: Contact): FormState => ({
    name: contact.name ?? '',
    role: contact.role ?? '',
    phone: contact.phone ?? '',
    address: contact.address ?? '',
    mapUrl: contact.mapUrl ?? '',
    comment: contact.comment ?? '',
});

const textOrNull = (value: string | boolean) => String(value).trim() || null;

const ContactFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { isStaff, isAdmin, loading: authLoading } = useAuth();

    const isEdit = Boolean(id);
    const [form, setForm] = useState<FormState>(empty);
    const [ready, setReady] = useState(!isEdit);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    const contactQuery = useQuery({
        queryKey: contactKeys.detail(id),
        enabled: isEdit && !authLoading && isStaff,
        queryFn: async () => {
            const { data, error: loadError } = await supabase
                .from('contacts')
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (loadError) throw loadError;
            return data as Contact | null;
        },
    });

    // данные приходят один раз — заполняем форму и больше не трогаем,
    // иначе перезапрос затирал бы то, что человек уже набрал
    if (isEdit && !ready && contactQuery.data) {
        setForm(toFormState(contactQuery.data));
        setReady(true);
    }

    const saveMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                name: String(form.name).trim(),
                role: textOrNull(form.role),
                phone: textOrNull(form.phone),
                address: textOrNull(form.address),
                mapUrl: textOrNull(form.mapUrl),
                comment: textOrNull(form.comment),
            };

            const { error: saveError } = isEdit
                ? await supabase.from('contacts').update(payload).eq('id', id)
                : await supabase.from('contacts').insert(payload);

            if (saveError) throw saveError;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: contactKeys.all });
            navigate('/contacts', { replace: true });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const { error: deleteError } = await supabase
                .from('contacts')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: contactKeys.all });
            navigate('/contacts', { replace: true });
        },
    });

    if (authLoading || (isEdit && contactQuery.isLoading)) {
        return (
            <div className="pt-safe bg-ground text-muted min-h-screen p-5">
                Загрузка…
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

    const setField = (name: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSave = () => {
        if (!String(form.name).trim()) {
            setError('Укажите имя');
            return;
        }
        saveMutation.mutate();
    };

    return (
        <div className="bg-ground min-h-screen pb-28">
            <header className="pt-safe px-5 pb-4">
                <div className="flex items-center gap-3">
                    <BackButton to="/contacts" />
                    <h1 className="text-ink text-2xl font-bold">
                        {isEdit ? 'Изменить контакт' : 'Новый контакт'}
                    </h1>
                </div>
            </header>

            <div className="space-y-4 px-5">
                {fields.map((field) => (
                    <FormControl
                        key={field.name}
                        field={field}
                        value={form[field.name]}
                        onChange={(value) => setField(field.name, value)}
                        error={field.name === 'name' ? error : undefined}
                    />
                ))}

                {(saveMutation.isError || deleteMutation.isError) && (
                    <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                        {humanError(saveMutation.error ?? deleteMutation.error)}
                    </p>
                )}

                <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="btn-accent w-full rounded-xl py-3 font-semibold disabled:opacity-50"
                >
                    {saveMutation.isPending ? 'Сохраняем…' : 'Сохранить'}
                </button>

                {isEdit && isAdmin && (
                    <button
                        onClick={() => setConfirmDelete(true)}
                        disabled={deleteMutation.isPending}
                        className="border-line bg-surface w-full rounded-xl border py-3 font-semibold text-red-600 disabled:opacity-50 dark:text-red-400"
                    >
                        {deleteMutation.isPending ? 'Удаляем…' : 'Удалить'}
                    </button>
                )}
            </div>

            {confirmDelete && (
                <ConfirmDialog
                    title="Удалить контакт?"
                    message={`«${form.name}» пропадёт из справочника. Отменить будет нельзя.`}
                    confirmLabel="Удалить"
                    busyLabel="Удаляем…"
                    busy={deleteMutation.isPending}
                    onConfirm={() => deleteMutation.mutate()}
                    onCancel={() => setConfirmDelete(false)}
                />
            )}
        </div>
    );
};

export default ContactFormPage;
