// Сколько объект считается новым. Одно число — легко поменять на 3 или 14 дней
const NEW_FOR_DAYS = 7;

export const isNew = (createdAt?: string) => {
    if (!createdAt) return false;

    const added = new Date(createdAt).getTime();
    if (!Number.isFinite(added)) return false;

    return Date.now() - added < NEW_FOR_DAYS * 24 * 60 * 60 * 1000;
};
