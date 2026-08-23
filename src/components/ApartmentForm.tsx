import { useState } from 'react';
import FormControl, { type Field } from './FormControl';
import type { Apartment, DealType } from '../types';

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

export type FormState = Record<string, string | boolean>;

const emptyForm: FormState = {
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

// Квартира из базы → значения формы: числа в строки, отсутствующее в пустую строку
const toFormState = (apt: Apartment): FormState => ({
    address: apt.address ?? '',
    ownerName: apt.ownerName ?? '',
    whatsapp: apt.whatsapp ?? '',
    mapUrl: apt.mapUrl ?? '',
    price: apt.price != null ? String(apt.price) : '',
    downPayment: apt.downPayment != null ? String(apt.downPayment) : '',
    installmentMonths:
        apt.installmentMonths != null ? String(apt.installmentMonths) : '',
    monthlyPayment:
        apt.monthlyPayment != null ? String(apt.monthlyPayment) : '',
    isSold: Boolean(apt.isSold),
    comment: apt.comment ?? '',
});

export type SubmitPayload = {
    form: FormState;
    dealType: DealType;
    files: File[];
    removedPhotos: string[];
};

type ApartmentFormProps = {
    initial?: Apartment; // есть — редактирование, нет — создание
    saving: boolean;
    submitLabel: string;
    onSubmit: (payload: SubmitPayload) => void;
};

const ApartmentForm = ({
    initial,
    saving,
    submitLabel,
    onSubmit,
}: ApartmentFormProps) => {
    const [form, setForm] = useState<FormState>(
        initial ? toFormState(initial) : emptyForm
    );
    const [dealType, setDealType] = useState<DealType>(
        initial?.dealType ?? 'cash'
    );

    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const [removedPhotos, setRemovedPhotos] = useState<string[]>([]);

    const existingPhotos = (initial?.photos ?? []).filter(
        (url) => !removedPhotos.includes(url)
    );

    const removePhoto = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
        setFiles((prev) => [...prev, ...selected]);
        setPreviews((prev) => [
            ...prev,
            ...selected.map((f) => URL.createObjectURL(f)),
        ]);
        e.target.value = '';
    };

    const setField = (name: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const renderFields = (fields: Field[]) =>
        fields.map((field) => (
            <FormControl
                key={field.name}
                field={field}
                value={form[field.name]}
                onChange={(value) => setField(field.name, value)}
            />
        ));

    const handleSubmit = () => {
        if (!form.address) {
            alert('Укажите район');
            return;
        }
        onSubmit({ form, dealType, files, removedPhotos });
    };

    return (
        <div className="space-y-4 px-5">
            {renderFields(mainFields)}

            {/* Уже загруженные фото — при редактировании */}
            {existingPhotos.length > 0 && (
                <div>
                    <label className="mb-1 block text-sm text-gray-500">
                        Загруженные фото
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {existingPhotos.map((url) => (
                            <div
                                key={url}
                                className="relative aspect-square overflow-hidden rounded-xl bg-gray-200"
                            >
                                <img
                                    src={url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setRemovedPhotos((prev) => [
                                            ...prev,
                                            url,
                                        ])
                                    }
                                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    {removedPhotos.length > 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                            {removedPhotos.length} фото удалим после сохранения
                        </p>
                    )}
                </div>
            )}

            {/* Новые фото */}
            <div>
                <label className="mb-1 block text-sm text-gray-500">
                    {initial ? 'Добавить фото' : 'Фото'}
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
                onClick={handleSubmit}
                disabled={saving}
                className="w-full rounded-xl bg-blue-500 py-3 font-semibold text-white active:opacity-80 disabled:opacity-50"
            >
                {saving ? 'Сохраняем...' : submitLabel}
            </button>
        </div>
    );
};

export default ApartmentForm;
