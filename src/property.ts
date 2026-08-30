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
