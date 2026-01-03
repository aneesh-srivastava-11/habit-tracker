/**
 * Reports Page
 * 
 * Analytics and visualizations for habit tracking data.
 * Shows weekly/monthly trends, streak comparisons, and badge progress.
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHabits, getStats, getStreaks, getBadges } from '../services/api';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Reports = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [habits, setHabits] = useState([]);
    const [stats, setStats] = useState(null);
    const [streaks, setStreaks] = useState({});
    const [badges, setBadges] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [habitsData, statsData, streaksData, badgesData] = await Promise.all([
                getHabits(),
                getStats(),
                getStreaks(),
                getBadges()
            ]);

            setHabits(habitsData);
            setStats(statsData);
            setStreaks(streaksData);
            setBadges(badgesData.badges);
        } catch (error) {
            console.error('Failed to load reports data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    // Prepare streak comparison data
    const streakData = habits.map(habit => ({
        name: habit.name.length > 15 ? habit.name.substring(0, 15) + '...' : habit.name,
        streak: streaks[habit._id] || 0
    })).sort((a, b) => b.streak - a.streak);

    // Prepare badge progress data
    const badgeData = habits.map(habit => {
        const habitBadges = badges[habit._id] || [];
        return {
            name: habit.name.length > 12 ? habit.name.substring(0, 12) + '...' : habit.name,
            earned: habitBadges.length,
            total: 8
        };
    });

    // Calculate overall badge completion
    const totalBadgesEarned = Object.values(badges).reduce((sum, arr) => sum + arr.length, 0);
    const totalBadgesPossible = habits.length * 8;
    const badgeCompletionRate = totalBadgesPossible > 0
        ? Math.round((totalBadgesEarned / totalBadgesPossible) * 100)
        : 0;

    // Pie chart data for overall progress
    const overallProgressData = [
        { name: 'Completed', value: stats?.completionRate || 0 },
        { name: 'Remaining', value: 100 - (stats?.completionRate || 0) }
    ];

    const COLORS = ['#ffffff', '#2a2a2a'];

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Reports & Analytics</h1>
                        <p className="text-text-secondary">Track your progress over time</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/dashboard" className="btn btn-secondary">
                            ← Dashboard
                        </Link>
                        <button onClick={handleLogout} className="btn btn-secondary">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="card">
                        <p className="text-text-secondary text-sm mb-1">Total Habits</p>
                        <p className="text-3xl font-bold">{habits.length}</p>
                    </div>
                    <div className="card">
                        <p className="text-text-secondary text-sm mb-1">Active Streaks</p>
                        <p className="text-3xl font-bold">
                            {Object.values(streaks).filter(s => s > 0).length}
                        </p>
                    </div>
                    <div className="card">
                        <p className="text-text-secondary text-sm mb-1">Completion Rate</p>
                        <p className="text-3xl font-bold">{stats?.completionRate || 0}%</p>
                    </div>
                    <div className="card">
                        <p className="text-text-secondary text-sm mb-1">Badges Earned</p>
                        <p className="text-3xl font-bold">{totalBadgesEarned}/{totalBadgesPossible}</p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Streak Comparison Chart */}
                    <div className="card">
                        <h3 className="text-xl font-semibold mb-4">Current Streaks</h3>
                        {streakData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={streakData} layout="horizontal">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                    <XAxis type="number" stroke="#666666" />
                                    <YAxis dataKey="name" type="category" width={100} stroke="#666666" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                                        labelStyle={{ color: '#ffffff' }}
                                    />
                                    <Bar dataKey="streak" fill="#ffffff" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-text-muted text-center py-12">No habit data available</p>
                        )}
                    </div>

                    {/* Overall Completion */}
                    <div className="card">
                        <h3 className="text-xl font-semibold mb-4">Overall Completion</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={overallProgressData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {overallProgressData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Badge Progress */}
                    <div className="card">
                        <h3 className="text-xl font-semibold mb-4">Badge Progress by Habit</h3>
                        {badgeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={badgeData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                    <XAxis dataKey="name" stroke="#666666" angle={-45} textAnchor="end" height={80} />
                                    <YAxis stroke="#666666" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                                        labelStyle={{ color: '#ffffff' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="earned" fill="#ffffff" name="Earned" />
                                    <Bar dataKey="total" fill="#2a2a2a" name="Total Possible" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-text-muted text-center py-12">No badge data available</p>
                        )}
                    </div>

                    {/* Completion Trend */}
                    <div className="card">
                        <h3 className="text-xl font-semibold mb-4">Monthly Completion Trend</h3>
                        <div className="flex flex-col items-center justify-center h-[300px]">
                            <div className="text-center">
                                <p className="text-6xl font-bold mb-2">{stats?.completionRate || 0}%</p>
                                <p className="text-text-secondary">Last 30 Days</p>
                                <p className="text-sm text-text-muted mt-4">
                                    {stats?.last30Days?.completed || 0} / {stats?.last30Days?.total || 0} completions
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Insights */}
                <div className="card mt-6">
                    <h3 className="text-xl font-semibold mb-4">Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-dark-bg rounded border border-dark-border">
                            <p className="text-sm text-text-secondary mb-1">Longest Streak</p>
                            <p className="text-2xl font-bold">
                                {Math.max(...Object.values(streaks), 0)} days
                            </p>
                        </div>
                        <div className="p-4 bg-dark-bg rounded border border-dark-border">
                            <p className="text-sm text-text-secondary mb-1">Badge Completion</p>
                            <p className="text-2xl font-bold">{badgeCompletionRate}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
