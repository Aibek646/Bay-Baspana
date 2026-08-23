export const apartmentKeys = {
    all: ['apartments'],
    counts: () => ['apartments', 'counts'],
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
