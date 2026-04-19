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

    const now = new Date();
    const todayDay = now.getDate();
    const todayMonth = now.getMonth();
    const todayYear = now.getFullYear();
    const isCurrentMonth =
        displayMonth.getMonth() === todayMonth &&
        displayMonth.getFullYear() === todayYear;

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
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-lg">
                                    {displayMonth.toLocaleString('default', { month: 'short' }).toUpperCase()} {displayMonth.getFullYear()}
                                </span>
                                {!isCurrentMonth && (
                                    <button
                                        type="button"
                                        className="text-xs text-purple-600 hover:text-purple-800 underline underline-offset-2 font-medium"
                                        onClick={() => setDisplayMonth(new Date(todayYear, todayMonth, 1))}
                                    >
                                        Today
                                    </button>
                                )}
                            </div>
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
                                const isToday = isCurrentMonth && day === todayDay;
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        title={isToday ? 'Today' : undefined}
                                        className={[
                                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition relative',
                                            isSelected
                                                ? 'bg-purple-500 text-white shadow-sm'
                                                : isToday
                                                    ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-400 ring-offset-1 font-bold hover:bg-purple-200'
                                                    : 'hover:bg-purple-100 text-gray-700',
                                        ].join(' ')}
                                        onClick={() => handleDayClick(day)}
                                    >
                                        {day}
                                        {isToday && !isSelected && (
                                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {isCurrentMonth && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 border-t pt-2 mt-1">
                                <span className="w-3 h-3 rounded-full bg-purple-100 ring-2 ring-purple-400 inline-block shrink-0" />
                                <span>Today — {now.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
        </div>
    );
};

export default Calendar; 