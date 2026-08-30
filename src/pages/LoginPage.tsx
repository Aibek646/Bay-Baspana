import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../supabase.ts';

const inputClass =
    'w-full rounded-xl border border-line bg-surface p-3 text-ink outline-none focus:border-blue-400';

const LoginPage = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        setLoading(false);
        if (error) {
            setError('Неверный email или пароль');
            return;
        }
        navigate('/');
    };

    // письмо со ссылкой на /password: там Supabase создаст сессию,
    // и откроется та же форма смены пароля
    const handleReset = async () => {
        if (!email) {
            setError('Введите email — на него отправим письмо');
            return;
        }

        setLoading(true);
        setError('');

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            email,
            { redirectTo: `${window.location.origin}/password` }
        );

        setLoading(false);

        if (resetError) {
            setError('Не удалось отправить письмо. Попробуйте позже');
            return;
        }

        setSent(true);
    };

    return (
        <div className="bg-ground min-h-screen px-5 pt-24">
            <h1 className="text-ink text-3xl font-bold">Вход</h1>
            <p className="text-muted mt-1 mb-6">Только для сотрудников</p>

            <div className="space-y-4">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email"
                    className={inputClass}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="пароль"
                    className={inputClass}
                />

                {error && (
                    <p className="text-sm text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full rounded-xl bg-blue-500 py-3 font-semibold text-white active:opacity-80 disabled:opacity-50"
                >
                    {loading ? 'Входим…' : 'Войти'}
                </button>

                <button
                    onClick={() => navigate('/')}
                    className="bg-line text-ink w-full rounded-xl py-3 font-medium active:opacity-70"
                >
                    Назад к объектам
                </button>

                {sent ? (
                    <p className="text-center text-sm text-green-700 dark:text-green-400">
                        Письмо отправлено. Откройте ссылку из него на этом же
                        телефоне.
                    </p>
                ) : (
                    <button
                        onClick={handleReset}
                        disabled={loading}
                        className="w-full py-2 text-sm font-medium text-blue-600 active:opacity-70 disabled:opacity-50 dark:text-blue-400"
                    >
                        Забыли пароль?
                    </button>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
