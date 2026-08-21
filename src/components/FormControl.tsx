export type FieldType = 'text' | 'number' | 'textarea' | 'checkbox' | 'select';

export type Field = {
    name: string;
    label?: string;
    placeholder?: string;
    type?: FieldType;
    options?: { value: string; label: string }[];
};

type FormControlProps = {
    field: Field;
    value: string | boolean;
    onChange: (value: string | boolean) => void;
};

const inputClass =
    'w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 outline-none focus:border-blue-400';

const FormControl = ({ field, value, onChange }: FormControlProps) => {
    const { name, label, type = 'text', placeholder, options } = field;

    const id = `id-${name}-${type}`;

    // чекбокс — особый случай: label и поле в одной строке
    if (type === 'checkbox') {
        return (
            <label
                htmlFor={id}
                className="flex items-center justify-between rounded-xl bg-white p-3"
            >
                <span className="text-gray-700">{label}</span>
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
                placeholder={placeholder}
                value={String(value ?? '')}
                onChange={(e) => onChange(e.target.value)}
                className={inputClass}
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
                className={inputClass}
            />
        );
    } else if (type === 'select') {
        inputElement = (
            <select
                id={id}
                value={String(value ?? '')}
                onChange={(e) => onChange(e.target.value)}
                className={inputClass}
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
            <label htmlFor={id} className="mb-1 block text-sm text-gray-500">
                {label}
            </label>
            {inputElement}
        </div>
    );
};

export default FormControl;
