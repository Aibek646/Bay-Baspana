import { supabase } from './supabase';
import { compressImage } from './image.ts';

const BUCKET = 'apartment-photos';

export const uploadPhotos = async (files: File[]) => {
    const urls: string[] = [];

    try {
        for (const file of files) {
            const prepared = await compressImage(file);

            const ext = prepared.name.split('.').pop();
            const path = `${crypto.randomUUID()}.${ext}`;

            const { error } = await supabase.storage
                .from(BUCKET)
                .upload(path, prepared);
            if (error) throw error;

            const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
            urls.push(data.publicUrl);
        }

        return urls;
    } catch (err) {
        // подчищаем то, что успели загрузить, и передаём ошибку выше
        await deletePhotos(urls).catch((err) =>
            console.warn('Не удалось убрать загруженные фото:', err)
        );
        throw err;
    }
};
// Публичная ссылка → путь внутри bucket:
// https://<проект>.supabase.co/storage/v1/object/public/apartment-photos/abc.jpg → abc.jpg
const urlToPath = (url: string) => url.split(`/${BUCKET}/`)[1];

export const deletePhotos = async (urls: string[]) => {
    const paths = urls
        .map(urlToPath)
        .filter((path): path is string => Boolean(path));

    if (paths.length === 0) return;

    const { data, error } = await supabase.storage.from(BUCKET).remove(paths);
    if (error) throw error;

    if (!data || data.length !== paths.length) {
        throw new Error(
            `Удалено ${data?.length ?? 0} файлов из ${paths.length} — проверь политики Storage`
        );
    }
};
