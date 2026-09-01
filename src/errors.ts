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

// Проблема с доступом, а не с интернетом: сессия истекла или база отказала
// в правах. Показывать «проверьте интернет» здесь — врать пользователю
export const isAccessError = (err: unknown): boolean => {
    const code = (err as { code?: string } | null)?.code ?? '';
    const message = (err as { message?: string } | null)?.message ?? '';

    return (
        code === 'PGRST301' || // JWT истёк
        code === '42501' || // permission denied for view/table
        message.includes('JWT') ||
        message.includes('permission denied')
    );
};
