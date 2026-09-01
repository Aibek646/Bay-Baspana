// Условия подписки в одном месте: менять цену или номер — только здесь
export const SUBSCRIPTION_PRICE = 9990;
export const SUBSCRIPTION_MONTHS = 12;
export const KASPI_PHONE = '+7 776 000 6837';

// Код для сопоставления перевода с аккаунтом. Каспи показывает имя
// плательщика, а не почту, поэтому просим указать код в комментарии
export const accessCode = (userId: string) =>
    'BB-' + userId.replace(/-/g, '').slice(0, 4).toUpperCase();
