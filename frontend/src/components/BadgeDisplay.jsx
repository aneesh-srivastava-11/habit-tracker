/**
 * Badge Display Component
 * 
 * Shows earned badges for a habit.
 * Displays badge icons and names in grayscale.
 */

const BadgeDisplay = ({ badges }) => {
    if (!badges || badges.length === 0) {
        return (
            <div className="text-xs text-text-muted">
                No badges earned yet
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
                <div
                    key={badge.days}
                    className="badge"
                    title={badge.description}
                >
                    <span className="text-lg grayscale">{badge.icon}</span>
                    <span className="text-xs ml-1">{badge.name}</span>
                </div>
            ))}
        </div>
    );
};

export default BadgeDisplay;
