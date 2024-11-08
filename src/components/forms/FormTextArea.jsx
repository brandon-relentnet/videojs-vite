import React from 'react';
import classNames from 'classnames';

const FormTextarea = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    error,
    touched,
    rows = 3,
}) => (
    <div className="mb-4">
        <label className="label">
            {label}:
        </label>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={classNames('input', {
                'border-red-500': touched && error,
            })}
            rows={rows}
        ></textarea>
        {touched && error && <div className="error-message">{error}</div>}
    </div>
);

export default FormTextarea;
