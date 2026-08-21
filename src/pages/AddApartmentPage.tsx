import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormControl, { type Field } from '../components/FormControl';
import type { DealType } from '../types';
import { supabase } from '../supabase.ts';

const mainFields: Field[] = [
    {
        name: 'address',
        label: 'Район / расположение (видят клиенты)',
        placeholder: 'мкр. Самал-2',
    },
    { name: 'ownerName', label: '🔒 Имя хозяина', placeholder: 'Асхат' },
    {
        name: 'whatsapp',
        label: '🔒 WhatsApp хозяина',
        placeholder: '+7 701 234 5678',
    },
    {
        name: 'mapUrl',
        label: '🔒 Точный адрес — ссылка на карту',
        placeholder: 'https://2gis.kz/almaty/...',
    },
    {
        name: 'price',
        label: 'Цена (₸)',
        type: 'number',
        placeholder: '42000000',
    },
];

const installmentFields: Field[] = [
    { name: 'downPayment', label: 'Первоначальный взнос (₸)', type: 'number' },
    { name: 'installmentMonths', label: 'Срок (месяцев)', type: 'number' },
    { name: 'monthlyPayment', label: 'Ежемесячный платёж (₸)', type: 'number' },
];

const tailFields: Field[] = [
    { name: 'isSold', label: 'Продано', type: 'checkbox' },
    {
        name: 'comment',
        label: '🔒 Комментарий',
        type: 'textarea',
        placeholder: 'впишите комментарий',
    },
];

const initialForm: Record<string, string | boolean> = {
    address: '',
    ownerName: '',
    whatsapp: '',
    mapUrl: '',
    price: '',
    downPayment: '',
    installmentMonths: '',
    monthlyPayment: '',
    isSold: false,
    comment: '',
};

const AddApartmentPage = () => {
    const { cityId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [dealType, setDealType] = useState<DealType>('cash');

    const [saving, setSaving] = useState(false);

    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
        setFiles((prev) => [...prev, ...selected]);
        setPreviews((prev) => [
            ...prev,
            ...selected.map((f) => URL.createObjectURL(f)),
        ]);
        e.target.value = '';
    };

    const removePhoto = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const setField = (name: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // маленький помощник, чтобы не писать FormControl трижды
    const renderFields = (fields: Field[]) =>
        fields.map((field) => (
            <FormControl
                key={field.name}
                field={field}
                value={form[field.name]}
                onChange={(value) => setField(field.name, value)}
            />
        ));

    const uploadPhotos = async () => {
        const urls: string[] = [];

        for (const file of files) {
            const ext = file.name.split('.').pop();
            const path = `${crypto.randomUUID()}.${ext}`;

            const { error } = await supabase.storage
                .from('apartment-photos')
                .upload(path, file);

            if (error) throw error;

            const { data } = supabase.storage
                .from('apartment-photos')
                .getPublicUrl(path);
            urls.push(data.publicUrl);
        }

        return urls;
    };

    const handleSave = async () => {
        if (!form.address) {
            alert('Укажите район');
            return;
        }

        setSaving(true);

        try {
            const photos = await uploadPhotos(); // ← сначала фото

            const isInstallment = dealType === 'installment';

            const newApartment = {
                cityId,
                address: String(form.address),
                ownerName: String(form.ownerName),
                whatsapp: String(form.whatsapp),
                mapUrl: String(form.mapUrl) || null,
                price: Number(form.price),
                isSold: Boolean(form.isSold),
                comment: String(form.comment),
                dealType,
                downPayment: isInstallment ? Number(form.downPayment) : null,
                installmentMonths: isInstallment
                    ? Number(form.installmentMonths)
                    : null,
                monthlyPayment: isInstallment
                    ? Number(form.monthlyPayment)
                    : null,
                photos, // ← ссылки в базу
            };

            const { error } = await supabase
                .from('apartments')
                .insert(newApartment);
            if (error) throw error;

            navigate(`/city/${cityId}`);
        } catch (err) {
            alert('Ошибка: ' + (err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 pb-28">
            <header className="px-5 pt-14 pb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-2 text-lg text-blue-500 active:opacity-60"
                >
                    ‹ Назад
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                    Новая квартира
                </h1>
            </header>

            <div className="space-y-4 px-5">
                {renderFields(mainFields)}

                <div>
                    <label className="mb-1 block text-sm text-gray-500">
                        Фото
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                        {previews.map((src, index) => (
                            <div
                                key={src}
                                className="relative aspect-square overflow-hidden rounded-xl bg-gray-200"
                            >
                                <img
                                    src={src}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white"
                                >
                                    ×
                                </button>
                            </div>
                        ))}

                        <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white text-3xl text-gray-400 active:opacity-70">
                            +
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFilesChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Тип оплаты — свой переключатель, не через FormControl */}
                <div>
                    <label className="mb-1 block text-sm text-gray-500">
                        Тип оплаты
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setDealType('cash')}
                            className={`flex-1 rounded-xl p-3 font-medium ${dealType === 'cash' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                        >
                            Наличными
                        </button>
                        <button
                            type="button"
                            onClick={() => setDealType('installment')}
                            className={`flex-1 rounded-xl p-3 font-medium ${dealType === 'installment' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                        >
                            Рассрочка
                        </button>
                    </div>
                </div>

                {dealType === 'installment' && (
                    <div className="space-y-4 rounded-xl bg-blue-50 p-4">
                        {renderFields(installmentFields)}
                    </div>
                )}

                {renderFields(tailFields)}

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full rounded-xl bg-blue-500 py-3 font-semibold text-white active:opacity-80 disabled:opacity-50"
                >
                    {saving ? 'Сохраняем...' : 'Cохранить'}
                </button>
            </div>
        </div>
    );
};

export default AddApartmentPage;
