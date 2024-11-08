import React from 'react';
import classNames from 'classnames';

const FormButton = ({ type, disabled, children }) => (
    <button
        type={type}
        disabled={disabled}
        className={classNames('button', {
            'disabled-button': disabled,
        })}
    >
        {children}
    </button>
);

export default FormButton;
