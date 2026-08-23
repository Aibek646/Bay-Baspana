export const humanError = (err: Error | null): string | undefined => {
    if (!err) return undefined;

    if (err.message.includes('Failed to fetch')) {
        return 'Нет связи с сервером. Проверьте интернет.';
    }

    if (err.message.includes('row-level security')) {
        return 'Недостаточно прав для этого действия.';
    }

    return err.message;
};
