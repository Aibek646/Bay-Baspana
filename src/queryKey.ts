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

export const contactKeys = {
    all: ['contacts'],
    list: () => ['contacts', 'list'],
    detail: (id?: string) => ['contacts', 'detail', id ?? null],
};
