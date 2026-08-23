const MAX_SIDE = 1600;
const QUALITY = 0.8;

export const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) return file;

    try {
        // imageOrientation: 'from-image' — обязательно, см. объяснение ниже
        const bitmap = await createImageBitmap(file, {
            imageOrientation: 'from-image',
        });

        const scale = Math.min(
            1,
            MAX_SIDE / Math.max(bitmap.width, bitmap.height)
        );

        const width = Math.round(bitmap.width * scale);
        const height = Math.round(bitmap.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return file;

        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', QUALITY)
        );

        // сжатие не помогло — отдаём оригинал
        if (!blob || blob.size >= file.size) return file;

        const name = file.name.replace(/\.\w+$/, '') + '.jpg';

        return new File([blob], name, {
            type: 'image/jpeg',
            lastModified: file.lastModified,
        });
    } catch (err) {
        console.warn('Не удалось сжать, загружаем как есть:', file.name, err);
        return file;
    }
};
