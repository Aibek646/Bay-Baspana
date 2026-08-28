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
    {
        name: 'videoUrl',
        label: 'Ссылка на видео в TikTok (видят клиенты)',
        placeholder: 'https://vm.tiktok.com/...',
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
    videoUrl: '',
};
type Errors = Record<string, string>;

const digitsOf = (value: string) => value.replace(/\D/g, '');

const validate = (form: FormState, dealType: DealType): Errors => {
    const errors: Errors = {};

    if (!String(form.address).trim()) {
        errors.address = 'Укажите район';
    }

    const priceRaw = String(form.price).trim();
    const price = Number(priceRaw);
    if (!priceRaw) {
        errors.price = 'Укажите цену';
    } else if (!Number.isFinite(price) || price <= 0) {
        errors.price = 'Цена должна быть больше нуля';
    }

    const wa = digitsOf(String(form.whatsapp));
    if (wa && (wa.length < 10 || wa.length > 15)) {
        errors.whatsapp = 'Похоже, номер неполный';
    }

    const mapUrl = String(form.mapUrl).trim();
    if (mapUrl && !/^https?:\/\//.test(mapUrl)) {
        errors.mapUrl = 'Ссылка должна начинаться с http';
    }
    const videoUrl = String(form.videoUrl).trim();
    if (videoUrl && !/^https?:\/\//.test(videoUrl)) {
        errors.videoUrl = 'Ссылка должна начинаться с http';
    }

    if (dealType === 'installment') {
        const required = [
            ['downPayment', 'Укажите первоначальный взнос'],
            ['installmentMonths', 'Укажите срок'],
            ['monthlyPayment', 'Укажите ежемесячный платёж'],
        ] as const;

        for (const [name, message] of required) {
            const raw = String(form[name]).trim();
            const value = Number(raw);
            if (!raw || !Number.isFinite(value) || value <= 0) {
                errors[name] = message;
            }
        }
    }

    return errors;
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
    videoUrl: apt.videoUrl ?? '',
});

export type SubmitPayload = {
    form: FormState;
    dealType: DealType;
    files: File[];
    removedPhotos: string[];
};

type ApartmentFormProps = {
    initial?: Apartment;
    saving: boolean;
    submitLabel: string;
    saveError?: string;
    onSubmit: (payload: SubmitPayload) => void;
};

const ApartmentForm = ({
    initial,
    saving,
    submitLabel,
    saveError,
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
    const [errors, setErrors] = useState<Errors>({});

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

        setErrors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const renderFields = (fields: Field[]) =>
        fields.map((field) => (
            <FormControl
                key={field.name}
                field={field}
                value={form[field.name]}
                onChange={(value) => setField(field.name, value)}
                error={errors[field.name]}
            />
        ));

    const handleSubmit = () => {
        const found = validate(form, dealType);
        setErrors(found);

        if (Object.keys(found).length > 0) return;

        onSubmit({ form, dealType, files, removedPhotos });
    };

    const changeDealType = (next: DealType) => {
        setDealType(next);
        setErrors({});
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
                        onClick={() => changeDealType('cash')}
                        className={`flex-1 rounded-xl p-3 font-medium ${dealType === 'cash' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                    >
                        Наличными
                    </button>
                    <button
                        type="button"
                        onClick={() => changeDealType('installment')}
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

            {Object.keys(errors).length > 0 && (
                <p className="text-sm text-red-500">
                    Проверьте выделенные поля
                </p>
            )}
            {saveError && (
                <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                    {saveError}
                </p>
            )}

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
