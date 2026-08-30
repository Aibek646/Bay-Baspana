export type City = {
    id: string;
    name: string;
};

export type DealType = 'cash' | 'installment';

export type PropertyType = 'apartment' | 'house' | 'commercial';

export type Apartment = {
    id: string;
    cityId: string;
    address: string;
    price: number;
    isSold: boolean;
    photos: string[];
    dealType: DealType;
    downPayment?: number;
    installmentMonths?: number;
    monthlyPayment?: number;
    videoUrl?: string;
    createdAt?: string;
    soldAt?: string;
    propertyType: PropertyType;
    landArea?: number;
    material?: string;

    rooms?: number;
    area?: number;
    floor?: number;
    floorsTotal?: number;
    builtYear?: number;

    // приватные — приходят только сотрудникам
    ownerName?: string;
    whatsapp?: string;
    mapUrl?: string; // 2ГИС
    yandexUrl?: string; // Яндекс.Карты
    comment?: string;
    complex?: string;
};

// Справочник сотрудников: нотариусы, банки, оценщики.
// Клиентам не показывается — таблица закрыта на уровне базы
export type Contact = {
    id: string;
    name: string;
    role?: string;
    phone?: string;
    address?: string;
    mapUrl?: string;
    comment?: string;
    createdAt?: string;
};
