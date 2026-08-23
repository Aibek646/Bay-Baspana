import { supabase } from './supabase';

const BUCKET = 'apartment-photos';

export const uploadPhotos = async (files: File[]) => {
    const urls: string[] = [];

    for (const file of files) {
        const ext = file.name.split('.').pop();
        const path = `${crypto.randomUUID()}.${ext}`;

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, file);
        if (error) throw error;

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        urls.push(data.publicUrl);
    }

    return urls;
};

// Публичная ссылка → путь внутри bucket:
// https://<проект>.supabase.co/storage/v1/object/public/apartment-photos/abc.jpg → abc.jpg
const urlToPath = (url: string) => url.split(`/${BUCKET}/`)[1];

export const deletePhotos = async (urls: string[]) => {
    const paths = urls
        .map(urlToPath)
        .filter((path): path is string => Boolean(path));

    if (paths.length === 0) return;

    const { error } = await supabase.storage.from(BUCKET).remove(paths);
    if (error) throw error;
};
