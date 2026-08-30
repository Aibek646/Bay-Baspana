import type { PropertyType } from './types';

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
    { value: 'apartment', label: 'Квартира' },
    { value: 'house', label: 'Дом' },
    { value: 'commercial', label: 'Коммерция' },
];

// Поля, состав которых зависит от типа объекта.
// Всё остальное — район, цена, фото, контакты — показывается всегда.
const TYPE_DEPENDENT = [
    'rooms',
    'area',
    'landArea',
    'floor',
    'floorsTotal',
    'builtYear',
    'complex',
];

const fieldsByType: Record<PropertyType, string[]> = {
    apartment: [
        'rooms',
        'area',
        'floor',
        'floorsTotal',
        'builtYear',
        'complex',
    ],
    house: ['rooms', 'area', 'landArea', 'floorsTotal', 'builtYear'],
    commercial: ['area', 'floor', 'floorsTotal', 'builtYear', 'complex'],
};

export const isFieldVisible = (type: PropertyType, name: string) =>
    !TYPE_DEPENDENT.includes(name) || fieldsByType[type].includes(name);

export const propertyTypeLabel = (type: PropertyType) =>
    PROPERTY_TYPES.find((item) => item.value === type)?.label ?? '';

// заглушка вместо фотографии — заодно тип читается до текста
export const propertyTypeEmoji: Record<PropertyType, string> = {
    apartment: '🏢',
    house: '🏠',
    commercial: '🏪',
};

// Цвет типа — чтобы в списке тип читался мельком, до чтения текста.
// Жёлтый занят меткой «Новое», серый — «Продано», поэтому не берём их
export const propertyTypeChip: Record<PropertyType, string> = {
    apartment: 'bg-blue-100 text-blue-700',
    house: 'bg-emerald-100 text-emerald-700',
    commercial: 'bg-violet-100 text-violet-700',
};
