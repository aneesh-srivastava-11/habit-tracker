/**
 * Checkbox Grid Component
 * 
 * Displays a 7-day checkbox grid for daily habit tracking.
 * Shows last 7 days with completion status.
 */

import { getLastNDays, formatDayOfWeek, isToday } from '../utils/dateUtils';

const CheckboxGrid = ({ habitId, logs, onToggle }) => {
    const last7Days = getLastNDays(7);

    const isCompleted = (date) => {
        const log = logs.find(l => l.habitId === habitId && l.date === date);
        return log?.completed || false;
    };

    const handleClick = (date) => {
        const completed = !isCompleted(date);
        onToggle(habitId, date, completed);
    };

    return (
        <div className="flex gap-2">
            {last7Days.map((date) => {
                const completed = isCompleted(date);
                const today = isToday(date);

                return (
                    <div key={date} className="flex flex-col items-center gap-1">
                        <span className={`text-xs ${today ? 'text-white font-semibold' : 'text-text-muted'}`}>
                            {formatDayOfWeek(date)}
                        </span>
                        <button
                            onClick={() => handleClick(date)}
                            className={`checkbox ${completed ? 'checkbox-checked' : ''} ${today ? 'ring-1 ring-white' : ''}`}
                            title={`${date} - ${completed ? 'Completed' : 'Not completed'}`}
                        >
                            {completed && (
                                <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default CheckboxGrid;
