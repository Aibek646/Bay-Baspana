import type { Apartment, PropertyType } from './types';

export type Filters = {
    query: string;
    propertyType: PropertyType | 'all';
    rooms: number | null; // 4 означает «4 и больше»
    priceFrom: string;
    priceTo: string;
    hideSold: boolean;
};

export const emptyFilters: Filters = {
    query: '',
    propertyType: 'all',
    rooms: null,
    priceFrom: '',
    priceTo: '',
    hideSold: false,
};

// сколько фильтров включено — показываем числом на кнопке
export const activeCount = (filters: Filters) =>
    [
        filters.query.trim() !== '',
        filters.propertyType !== 'all',
        filters.rooms !== null,
        filters.priceFrom.trim() !== '',
        filters.priceTo.trim() !== '',
        filters.hideSold,
    ].filter(Boolean).length;

export const applyFilters = (list: Apartment[], filters: Filters) => {
    const query = filters.query.trim().toLowerCase();
    const from =
        filters.priceFrom.trim() === '' ? null : Number(filters.priceFrom);
    const to = filters.priceTo.trim() === '' ? null : Number(filters.priceTo);

    return list.filter((apt) => {
        if (filters.hideSold && apt.isSold) return false;

        if (
            filters.propertyType !== 'all' &&
            apt.propertyType !== filters.propertyType
        ) {
            return false;
        }

        if (filters.rooms !== null) {
            // объект без указанных комнат под фильтр по комнатам не подходит
            if (apt.rooms == null) return false;

            const matches =
                filters.rooms === 4
                    ? apt.rooms >= 4
                    : apt.rooms === filters.rooms;

            if (!matches) return false;
        }

        if (from !== null && apt.price < from) return false;
        if (to !== null && apt.price > to) return false;

        if (query && !apt.address.toLowerCase().includes(query)) return false;

        return true;
    });
};
