/**
 * Monthly Chart Component
 * 
 * Simple bar chart showing completion rate for the current month.
 * Grayscale visualization.
 */

const MonthlyChart = ({ completionRate }) => {
    const percentage = Math.min(100, Math.max(0, completionRate || 0));

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Monthly Completion</span>
                <span className="text-white font-semibold">{percentage}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-dark-card border border-dark-border rounded-full overflow-hidden">
                <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Motivational Text */}
            <p className="text-xs text-text-muted text-center">
                {percentage >= 80 && "Excellent progress! 🎯"}
                {percentage >= 50 && percentage < 80 && "Keep it up! 💪"}
                {percentage >= 20 && percentage < 50 && "You can do better! 🚀"}
                {percentage < 20 && "Start building your streaks! ⭐"}
            </p>
        </div>
    );
};

export default MonthlyChart;
