export const apartmentKeys = {
    all: ['apartments'],
    list: (table: string, cityId?: string) => [
        'apartments',
        'list',
        table,
        cityId ?? null,
    ],
    detail: (table: string, id?: string) => [
        'apartments',
        'detail',
        table,
        id ?? null,
    ],
};
