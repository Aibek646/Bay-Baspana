import type { FormState } from './components/ApartmentForm';
import type { DealType, PropertyType } from './types';
import { isFieldVisible } from './property';

// '' → null, иначе число. Пустое поле в базе должно быть null, а не 0
export const numOrNull = (value: string | boolean) => {
    const raw = String(value).trim();
    return raw === '' ? null : Number(raw);
};

const textOrNull = (value: string | boolean) => String(value).trim() || null;

// Общие колонки объекта из значений формы.
// cityId и photos добавляют страницы сами: город известен только при создании,
// а фото в Add и Edit собираются по-разному.
export const formToApartment = (
    form: FormState,
    dealType: DealType,
    propertyType: PropertyType
) => {
    const isInstallment = dealType === 'installment';
    const visible = (name: string) => isFieldVisible(propertyType, name);

    // Невидимое для этого типа не сохраняем: пользователь мог заполнить
    // «Этаж» как квартиру, а потом переключиться на «Дом»
    const numIfVisible = (name: string) =>
        visible(name) ? numOrNull(form[name]) : null;

    return {
        propertyType,
        address: String(form.address).trim(),
        price: Number(form.price),
        isSold: Boolean(form.isSold),
        dealType,

        rooms: numIfVisible('rooms'),
        area: numIfVisible('area'),
        landArea: numIfVisible('landArea'),
        floor: numIfVisible('floor'),
        floorsTotal: numIfVisible('floorsTotal'),
        builtYear: numIfVisible('builtYear'),
        videoUrl: textOrNull(form.videoUrl),

        downPayment: isInstallment ? numOrNull(form.downPayment) : null,
        installmentMonths: isInstallment
            ? numOrNull(form.installmentMonths)
            : null,
        monthlyPayment: isInstallment ? numOrNull(form.monthlyPayment) : null,

        ownerName: textOrNull(form.ownerName),
        whatsapp: textOrNull(form.whatsapp),
        complex: visible('complex') ? textOrNull(form.complex) : null,
        mapUrl: textOrNull(form.mapUrl),
        comment: textOrNull(form.comment),
    };
};
