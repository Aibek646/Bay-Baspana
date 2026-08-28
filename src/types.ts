export type City = {
    id: string;
    name: string;
};

export type DealType = 'cash' | 'installment';

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

    // приватные — приходят только админу
    ownerName?: string;
    whatsapp?: string;
    mapUrl?: string;
    comment?: string;
};
