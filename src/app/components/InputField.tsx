import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id?: string;
  name?: string;
  error?: string;
  classNameLabel?: string;
  classNameInput?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  name,
  error,
  classNameLabel,
  classNameInput,
  ...inputProps
}) => {
  return (
    <div>
      <label htmlFor={id} className={classNameLabel}>
        {label}
      </label>
      <input id={id} name={name} className={classNameInput} {...inputProps} />
      {error && <p className="text-red-500 mt-1">{error}</p>}
    </div>
  );
};
