/**
 * Habit Card Component
 * 
 * Displays individual habit with:
 * - Name and icon
 * - 7-day checkbox grid
 * - Current streak
 * - Earned badges
 * - Delete button
 */

import CheckboxGrid from './CheckboxGrid';
import StreakDisplay from './StreakDisplay';
import BadgeDisplay from './BadgeDisplay';

const HabitCard = ({ habit, logs, streak, badges, onToggle, onDelete }) => {
    const handleDelete = () => {
        if (window.confirm(`Delete "${habit.name}"? This will remove all tracking data.`)) {
            onDelete(habit._id);
        }
    };

    return (
        <div className="card animate-fadeIn hover:shadow-glow transition-smooth">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl grayscale">{habit.icon}</span>
                    <h3 className="text-lg font-semibold">{habit.name}</h3>
                </div>

                <button
                    onClick={handleDelete}
                    className="text-text-muted hover:text-white transition-colors"
                    title="Delete habit"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Checkbox Grid */}
            <div className="mb-4">
                <CheckboxGrid habitId={habit._id} logs={logs} onToggle={onToggle} />
            </div>

            {/* Streak */}
            <div className="mb-4">
                <StreakDisplay streak={streak || 0} />
            </div>

            {/* Badges */}
            <div>
                <p className="text-xs text-text-secondary mb-2">Badges Earned</p>
                <BadgeDisplay badges={badges || []} />
            </div>
        </div>
    );
};

export default HabitCard;
