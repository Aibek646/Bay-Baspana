import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton.tsx';
import { supabase } from '../supabase.ts';
import { useAuth } from '../useAuth.ts';
import { humanError } from '../errors.ts';

const inputClass =
    'w-full rounded-xl border border-line bg-surface p-3 text-ink outline-none focus:border-blue-400';

const PasswordPage = () => {
    const navigate = useNavigate();
    const { session, loading } = useAuth();

    const [password, setPassword] = useState('');
    const [repeat, setRepeat] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);

    if (loading) {
        return (
            <div className="pt-safe bg-ground text-muted min-h-screen p-5">
                Загрузка…
            </div>
        );
    }

    // Сюда же ведёт ссылка из письма «Забыли пароль»: Supabase разбирает её
    // и создаёт сессию. Нет сессии — значит ссылка устарела или вход не сделан
    if (!session) {
        return (
            <div className="pt-safe bg-ground min-h-screen p-5">
                <BackButton to="/" />
                <p className="text-ink mt-4">
                    Ссылка устарела или вы не вошли в аккаунт.
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="mt-4 w-full rounded-xl bg-blue-500 py-3 font-semibold text-white active:opacity-80"
                >
                    Войти
                </button>
            </div>
        );
    }

    const handleSave = async () => {
        if (password.length < 8) {
            setError('Пароль должен быть не короче 8 символов');
            return;
        }
        if (password !== repeat) {
            setError('Пароли не совпадают');
            return;
        }

        setSaving(true);
        setError('');

        const { error: updateError } = await supabase.auth.updateUser({
            password,
        });

        setSaving(false);

        if (updateError) {
            setError(humanError(updateError) ?? 'Не удалось сменить пароль');
            return;
        }

        setDone(true);
    };

    return (
        <div className="pt-safe bg-ground min-h-screen px-5">
            <BackButton to="/" />

            <h1 className="text-ink mt-4 text-3xl font-bold">Смена пароля</h1>
            <p className="text-muted mt-1 mb-6">{session.user.email}</p>

            {done ? (
                <div className="bg-surface rounded-2xl p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                    <p className="text-ink font-semibold">Пароль изменён</p>
                    <p className="text-muted mt-1">
                        В следующий раз входите с новым паролем.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 w-full rounded-xl bg-blue-500 py-3 font-semibold text-white active:opacity-80"
                    >
                        К объектам
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="новый пароль"
                        autoComplete="new-password"
                        className={inputClass}
                    />
                    <input
                        type="password"
                        value={repeat}
                        onChange={(e) => setRepeat(e.target.value)}
                        placeholder="ещё раз"
                        autoComplete="new-password"
                        className={inputClass}
                    />

                    {error && (
                        <p className="text-sm text-red-500 dark:text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full rounded-xl bg-blue-500 py-3 font-semibold text-white active:opacity-80 disabled:opacity-50"
                    >
                        {saving ? 'Сохраняем…' : 'Сохранить пароль'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default PasswordPage;
