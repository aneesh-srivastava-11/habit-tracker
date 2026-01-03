/**
 * Dashboard Page
 * 
 * Main application page showing:
 * - User info and logout
 * - Add new habit form
 * - List of habit cards with tracking
 * - Monthly completion chart
 * - Overall stats
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getHabits,
    createHabit,
    deleteHabit,
    getLogs,
    logHabitCompletion,
    getStreaks,
    getBadges,
    getStats
} from '../services/api';
import { getLastNDays } from '../utils/dateUtils';
import HabitCard from '../components/HabitCard';
import MonthlyChart from '../components/MonthlyChart';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // State
    const [habits, setHabits] = useState([]);
    const [logs, setLogs] = useState([]);
    const [streaks, setStreaks] = useState({});
    const [badges, setBadges] = useState({});
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // New habit form
    const [showAddForm, setShowAddForm] = useState(false);
    const [newHabit, setNewHabit] = useState({ name: '', icon: '⭐' });

    /**
     * Load all data on mount
     */
    useEffect(() => {
        loadData();
    }, []);

    /**
     * Load habits, logs, streaks, badges, and stats
     */
    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch all data in parallel
            const [habitsData, logsData, streaksData, badgesData, statsData] = await Promise.all([
                getHabits(),
                getLogs(getLastNDays(7)[0], getLastNDays(7)[6]),
                getStreaks(),
                getBadges(),
                getStats()
            ]);

            setHabits(habitsData);
            setLogs(logsData);
            setStreaks(streaksData);
            setBadges(badgesData.badges);
            setStats(statsData);
        } catch (err) {
            setError(err || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle logout
     */
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    /**
     * Handle habit completion toggle
     */
    const handleToggle = async (habitId, date, completed) => {
        try {
            await logHabitCompletion({ habitId, date, completed });

            // Reload data to update streaks and badges
            await loadData();
        } catch (err) {
            setError(err || 'Failed to log completion');
        }
    };

    /**
     * Handle add new habit
     */
    const handleAddHabit = async (e) => {
        e.preventDefault();

        if (!newHabit.name.trim()) {
            setError('Habit name is required');
            return;
        }

        try {
            await createHabit(newHabit);
            setNewHabit({ name: '', icon: '⭐' });
            setShowAddForm(false);
            await loadData();
        } catch (err) {
            setError(err || 'Failed to create habit');
        }
    };

    /**
     * Handle delete habit
     */
    const handleDeleteHabit = async (habitId) => {
        try {
            await deleteHabit(habitId);
            await loadData();
        } catch (err) {
            setError(err || 'Failed to delete habit');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Habit Tracker</h1>
                        <p className="text-text-secondary">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn btn-secondary"
                    >
                        Logout
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded text-sm text-white">
                        {error}
                    </div>
                )}

                {/* Stats Overview */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="card">
                            <p className="text-text-secondary text-sm mb-1">Total Habits</p>
                            <p className="text-3xl font-bold">{stats.totalHabits}</p>
                        </div>
                        <div className="card">
                            <p className="text-text-secondary text-sm mb-1">Active Streaks</p>
                            <p className="text-3xl font-bold">
                                {Object.values(streaks).filter(s => s > 0).length}
                            </p>
                        </div>
                        <div className="card">
                            <MonthlyChart completionRate={stats.completionRate} />
                        </div>
                    </div>
                )}

                {/* Add Habit Button */}
                <div className="mb-6">
                    {!showAddForm ? (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="btn btn-primary"
                        >
                            + Add New Habit
                        </button>
                    ) : (
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Add New Habit</h3>
                            <form onSubmit={handleAddHabit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={newHabit.name}
                                            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                                            placeholder="Habit name (e.g., Morning run)"
                                            className="input"
                                            maxLength={100}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={newHabit.icon}
                                            onChange={(e) => setNewHabit({ ...newHabit, icon: e.target.value })}
                                            placeholder="Icon (emoji)"
                                            className="input text-center text-2xl"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="btn btn-primary">
                                        Add Habit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setNewHabit({ name: '', icon: '⭐' });
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Habits List */}
                {habits.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-text-secondary mb-4">No habits yet. Add your first habit to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {habits.map((habit) => (
                            <HabitCard
                                key={habit._id}
                                habit={habit}
                                logs={logs}
                                streak={streaks[habit._id]}
                                badges={badges[habit._id]}
                                onToggle={handleToggle}
                                onDelete={handleDeleteHabit}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
