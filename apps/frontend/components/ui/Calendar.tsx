import { useState, useRef, useEffect } from 'react';

interface CalendarProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    error?: string;
    disabled?: boolean;
}

function pad(n: number) {
    return n < 10 ? `0${n}` : `${n}`;
}

const Calendar: React.FC<CalendarProps> = ({ value, onChange, label, error, disabled }) => {
    const [show, setShow] = useState(true); // Always show calendar
    const [selected, setSelected] = useState<Date | null>(value ? new Date(value) : null);
    const [displayMonth, setDisplayMonth] = useState(() => {
        if (value) return new Date(value);
        return new Date();
    });
    const ref = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     function handleClick(e: MouseEvent) {
    //         if (ref.current && !ref.current.contains(e.target as Node)) {
    //             setShow(false);
    //         }
    //     }
    //     if (show) document.addEventListener('mousedown', handleClick);
    //     return () => document.removeEventListener('mousedown', handleClick);
    // }, [show]);

    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    const handleDayClick = (day: number) => {
        const d = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
        setSelected(d);
        onChange(d.toISOString());
    };

    return (
        <div className="w-full" ref={ref}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <div className="relative">
                {show && (
                    <div className="bg-white border rounded-lg shadow-lg w-80 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <button
                                type="button"
                                className="p-1 rounded hover:bg-gray-100"
                                onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1))}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <span className="font-semibold text-lg">
                                {displayMonth.toLocaleString('default', { month: 'short' }).toUpperCase()} {displayMonth.getFullYear()}
                            </span>
                            <button
                                type="button"
                                className="p-1 rounded hover:bg-gray-100"
                                onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1))}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-7 text-xs text-gray-500 mb-1">
                            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
                                <div key={d} className="text-center py-1">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {Array.from({ length: (firstDayOfMonth(displayMonth.getMonth(), displayMonth.getFullYear()) + 6) % 7 }).map((_, i) => (
                                <div key={i}></div>
                            ))}
                            {Array.from({ length: daysInMonth(displayMonth.getMonth(), displayMonth.getFullYear()) }).map((_, i) => {
                                const day = i + 1;
                                const isSelected = selected &&
                                    selected.getDate() === day &&
                                    selected.getMonth() === displayMonth.getMonth() &&
                                    selected.getFullYear() === displayMonth.getFullYear();
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-purple-500 text-white' : 'hover:bg-purple-100'} transition`}
                                        onClick={() => handleDayClick(day)}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
        </div>
    );
};

export default Calendar; 