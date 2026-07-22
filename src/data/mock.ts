export type City = {
    id: string;
    name: string;
};

export type DealType = 'cash' | 'installment';

export type Apartment = {
    id: string;
    cityId: string;
    address: string;
    ownerName: string;
    whatsapp: string;
    price: number;
    isSold: boolean;
    comment: string;
    photos: string[];
    dealType: DealType;
    downPayment?: number;
    installmentMonths?: number;
    monthlyPayment?: number;
};

export const cities: City[] = [
    { id: 'almaty', name: 'Алматы' },
    { id: 'astana', name: 'Астана' },
];

export const apartments: Apartment[] = [
    {
        id: '1',
        cityId: 'almaty',
        address: 'ул. Абая 150, кв. 45',
        ownerName: 'Асхат',
        whatsapp: '+7 701 234 5678',
        price: 42000000,
        isSold: false,
        comment: 'Торг возможен, 3 комнаты',
        photos: [],
        dealType: 'installment',
        downPayment: 12000000,
        installmentMonths: 24,
        monthlyPayment: 1400000,
    },
    {
        id: '2',
        cityId: 'almaty',
        address: 'мкр. Самал-2, дом 33',
        ownerName: 'Гульнара',
        whatsapp: '+7 702 111 2233',
        price: 68000000,
        isSold: true,
        comment: 'Продано в июне',
        photos: [],
        dealType: 'cash',
    },
    {
        id: '3',
        cityId: 'astana',
        address: 'пр. Кабанбай батыра 11',
        ownerName: 'Ерлан',
        whatsapp: '+7 705 999 8877',
        price: 55000000,
        isSold: false,
        comment: 'Новый ЖК, 2 комнаты',
        photos: [],
        dealType: 'cash',
    },
];
