import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    isValid?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, isValid, className = '', ...props }, ref) => {
        const baseClasses = 'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors';
        const validClasses = isValid === true ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : '';
        const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : '';
        const normalClasses = !error && isValid !== true ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : '';

        return (
            <div className="space-y-1">
                {label && (
                    <label className="block text-sm font-medium text-black">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`${baseClasses} ${validClasses} ${errorClasses} ${normalClasses} ${className} text-black`}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input; 