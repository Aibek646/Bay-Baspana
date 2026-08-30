export type FieldType = 'text' | 'number' | 'textarea' | 'checkbox' | 'select';

export type Field = {
    name: string;
    label?: string;
    placeholder?: string;
    type?: FieldType;
    step?: string;
    options?: { value: string; label: string }[];
};

type FormControlProps = {
    field: Field;
    value: string | boolean;
    onChange: (value: string | boolean) => void;
    error?: string;
};

const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-surface p-3 text-ink outline-none ${
        hasError ? 'border-red-400' : 'border-line focus:border-blue-400'
    }`;

const FormControl = ({ field, value, onChange, error }: FormControlProps) => {
    const { name, label, type = 'text', placeholder, step, options } = field;

    const id = `id-${name}-${type}`;

    // чекбокс — особый случай: label и поле в одной строке
    if (type === 'checkbox') {
        return (
            <label
                htmlFor={id}
                className="bg-surface flex items-center justify-between rounded-xl p-3"
            >
                <span className="text-ink">{label}</span>
                <input
                    id={id}
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-5 w-5"
                />
            </label>
        );
    }

    let inputElement = null;

    if (type === 'text' || type === 'number') {
        inputElement = (
            <input
                id={id}
                type={type}
                step={step}
                placeholder={placeholder}
                value={String(value ?? '')}
                onChange={(e) => onChange(e.target.value)}
                className={inputClass(Boolean(error))}
            />
        );
    } else if (type === 'textarea') {
        inputElement = (
            <textarea
                id={id}
                rows={3}
                placeholder={placeholder}
                value={String(value ?? '')}
                onChange={(e) => onChange(e.target.value)}
                className={inputClass(Boolean(error))}
            />
        );
    } else if (type === 'select') {
        inputElement = (
            <select
                id={id}
                value={String(value ?? '')}
                onChange={(e) => onChange(e.target.value)}
                className={inputClass(Boolean(error))}
            >
                {options?.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    }

    return (
        <div>
            <label htmlFor={id} className="text-muted mb-1 block text-sm">
                {label}
            </label>
            {inputElement}
            {error && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
};

export default FormControl;
