/**
 * Streak Display Component
 * 
 * Shows current streak count with fire emoji.
 */

const StreakDisplay = ({ streak }) => {
    return (
        <div className="streak-display">
            <span className="text-2xl">🔥</span>
            <span className="text-white">{streak}</span>
            <span className="text-sm text-text-secondary">day{streak !== 1 ? 's' : ''}</span>
        </div>
    );
};

export default StreakDisplay;
