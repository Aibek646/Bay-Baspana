// Сколько объект считается новым. Одно число — легко поменять на 3 или 14 дней
const NEW_FOR_DAYS = 7;

export const isNew = (createdAt?: string) => {
    if (!createdAt) return false;

    const added = new Date(createdAt).getTime();
    if (!Number.isFinite(added)) return false;

    return Date.now() - added < NEW_FOR_DAYS * 24 * 60 * 60 * 1000;
};

// Через сколько дней после отметки «продано» объект уходит из списка.
// Данные при этом остаются: сделка может сорваться, а история продаж нужна
const ARCHIVE_AFTER_DAYS = 3;

export const isArchived = (isSold: boolean, soldAt?: string) => {
    if (!isSold || !soldAt) return false;

    const sold = new Date(soldAt).getTime();
    if (!Number.isFinite(sold)) return false;

    return Date.now() - sold > ARCHIVE_AFTER_DAYS * 24 * 60 * 60 * 1000;
};

// Действует ли доступ до указанной даты
export const isActiveUntil = (until?: string | null) => {
    if (!until) return false;

    const end = new Date(until).getTime();
    return Number.isFinite(end) && end > Date.now();
};
