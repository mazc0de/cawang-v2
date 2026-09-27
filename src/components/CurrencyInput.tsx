import React, { useState, useEffect } from 'react';
import type { InputHTMLAttributes } from 'react';

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number;
  onChange?: (val: number) => void;
  // If used in uncontrolled form, we still need name prop to extract value
  name?: string;
  defaultValue?: number;
}

export default function CurrencyInput({ value, onChange, defaultValue, name, className, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // Sinkronisasi dengan value dari luar (misal dari state)
  useEffect(() => {
    if (value !== undefined) {
      if (value === 0 && displayValue === '') {
        // Biarkan kosong jika user belum mengetik, atau isi '0' tergantung UX.
        setDisplayValue(value.toString());
      } else {
        setDisplayValue(formatNumber(value.toString()));
      }
    }
  }, [value]);

  // Jika dipanggil secara uncontrolled dengan defaultValue
  useEffect(() => {
    if (defaultValue !== undefined && value === undefined) {
      setDisplayValue(formatNumber(defaultValue.toString()));
    }
  }, [defaultValue, value]);

  const formatNumber = (val: string) => {
    // Hanya ambil digit angka dan tanda minus
    const cleanVal = val.replace(/[^\d-]/g, '');
    if (!cleanVal || cleanVal === '-') return cleanVal;
    
    // Format dengan pemisah ribuan titik (style Indonesia)
    const number = parseInt(cleanVal, 10);
    if (isNaN(number)) return '';
    return number.toLocaleString('id-ID');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatNumber(rawVal);
    
    setDisplayValue(formatted);
    
    if (onChange) {
      const numericVal = parseInt(formatted.replace(/\./g, ''), 10);
      onChange(isNaN(numericVal) ? 0 : numericVal);
    }
  };

  return (
    <>
      <input
        type="text"
        inputMode="numeric"
        className={className}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
      {/* Hidden input agar native form submit via e.target.elements tetap menerima unformatted number */}
      {name && (
        <input 
          type="hidden" 
          name={name} 
          value={displayValue ? parseInt(displayValue.replace(/\./g, ''), 10) : ''} 
        />
      )}
    </>
  );
}
