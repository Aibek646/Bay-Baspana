import type { FormState } from './components/ApartmentForm';
import type { DealType } from './types';

// '' → null, иначе число. Пустое поле в базе должно быть null, а не 0
export const numOrNull = (value: string | boolean) => {
    const raw = String(value).trim();
    return raw === '' ? null : Number(raw);
};

const textOrNull = (value: string | boolean) => String(value).trim() || null;

// Общие колонки квартиры из значений формы.
// cityId и photos добавляют страницы сами: город известен только при создании,
// а фото в Add и Edit собираются по-разному.
export const formToApartment = (form: FormState, dealType: DealType) => {
    const isInstallment = dealType === 'installment';

    return {
        address: String(form.address).trim(),
        price: Number(form.price),
        isSold: Boolean(form.isSold),
        dealType,

        rooms: numOrNull(form.rooms),
        area: numOrNull(form.area),
        floor: numOrNull(form.floor),
        floorsTotal: numOrNull(form.floorsTotal),
        builtYear: numOrNull(form.builtYear),
        videoUrl: textOrNull(form.videoUrl),

        downPayment: isInstallment ? numOrNull(form.downPayment) : null,
        installmentMonths: isInstallment
            ? numOrNull(form.installmentMonths)
            : null,
        monthlyPayment: isInstallment ? numOrNull(form.monthlyPayment) : null,

        ownerName: textOrNull(form.ownerName),
        whatsapp: textOrNull(form.whatsapp),
        complex: textOrNull(form.complex),
        mapUrl: textOrNull(form.mapUrl),
        comment: textOrNull(form.comment),
    };
};
