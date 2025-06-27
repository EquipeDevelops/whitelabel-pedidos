import React from 'react';

type InputProps = React.ComponentProps<'input'> & {
  label: string;
  type?: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

const Input = ({ label, type, setValue, value }: InputProps) => {
  return (
    <label>
      {label}
      <input
        type={type || 'text'}
        value={value}
        onChange={({ target }) => setValue(target.value)}
      />
    </label>
  );
};

export default Input;
