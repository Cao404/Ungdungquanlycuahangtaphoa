import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function InputField({ label, error, id, ...props }: InputFieldProps) {
  const inputId = id ?? props.name ?? label;

  return (
    <label className="field" htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} {...props} />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
