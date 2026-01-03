'use client';

import { useRef, useEffect, useState } from 'react';

interface OTPInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    error?: string;
    disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
    value,
    onChange,
    length = 6,
    error,
    disabled = false
}) => {
    const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const newDigits = value.split('').slice(0, length);
        while (newDigits.length < length) {
            newDigits.push('');
        }
        setDigits(newDigits);
    }, [value, length]);

    const handleChange = (index: number, digit: string) => {
        if (disabled) return;

        // Only allow digits
        if (digit && !/^\d$/.test(digit)) return;

        const newDigits = [...digits];
        newDigits[index] = digit;
        setDigits(newDigits);

        const newValue = newDigits.join('');
        onChange(newValue);

        // Auto-focus next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            // Focus previous input on backspace if current is empty
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

        if (pastedData) {
            const newDigits = pastedData.split('').slice(0, length);
            while (newDigits.length < length) {
                newDigits.push('');
            }
            setDigits(newDigits);
            onChange(newDigits.join(''));

            // Focus the next empty input or the last input
            const nextEmptyIndex = newDigits.findIndex(d => !d);
            const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
            inputRefs.current[focusIndex]?.focus();
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                Enter Verification Code
            </label>
            <div className="flex gap-3 justify-center">
                {digits.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={disabled}
                        className={`w-12 h-14 text-center text-black text-xl font-semibold border rounded-lg focus:outline-none focus:ring-2 transition-colors ${error
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                    />
                ))}
            </div>
            {error && (
                <p className="text-sm text-red-600 text-center flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

export default OTPInput; 