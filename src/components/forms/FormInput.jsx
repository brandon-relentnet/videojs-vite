import React from 'react';
import classNames from 'classnames';

const FormInput = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder,
    error,
    touched,
}) => (
    <div className="mb-4">
        <label className="label">
            {label}: {type !== 'number' && <span className="text-accent">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={classNames('input', {
                'border-red-500': touched && error,
            })}
        />
        {touched && error && <div className="error-message">{error}</div>}
    </div>
);

export default FormInput;
