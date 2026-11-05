// Chart.js Integration for Hanuman Gym Dashboard - Pure Yellow & Black Theme
class ChartManager {
    constructor() {
        this.charts = {};
        this.modalChart = null;
        this.initChartDefaults();
        this.init();
    }

    initChartDefaults() {
        if (typeof Chart === 'undefined') return;
        
        Chart.defaults.color = '#999999';
        Chart.defaults.font.family = "'Outfit', sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.plugins.tooltip.backgroundColor = '#161616';
        Chart.defaults.plugins.tooltip.titleColor = '#B3DD24';
        Chart.defaults.plugins.tooltip.bodyColor = '#FFFFFF';
        Chart.defaults.plugins.tooltip.borderColor = '#B3DD24';
        Chart.defaults.plugins.tooltip.borderWidth = 1.5;
        Chart.defaults.plugins.tooltip.padding = 12;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (window.dashboardManager && window.dashboardManager.currentUser) {
                    this.createAllCharts(window.dashboardManager.currentUser);
                }
            }, 100);
        });
    }

    createAllCharts(userData) {
        this.createWeightChart(userData);
        this.createWaterChart(userData);
        this.createCalorieChart(userData);
        this.createWorkoutChart(userData);
        this.createExerciseChart(userData);
        this.addChartInteractions();
    }

    updateAllCharts(userData) {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
        this.createAllCharts(userData);
    }

    getThemeScaleOptions(customY = {}) {
        return {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    tickColor: 'transparent'
                },
                ticks: {
                    color: '#999999',
                    font: { family: "'Outfit', sans-serif", size: 11 }
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    tickColor: 'transparent'
                },
                ticks: {
                    color: '#999999',
                    font: { family: "'Outfit', sans-serif", size: 11 }
                },
                ...customY
            }
        };
    }

    createWeightChart(userData) {
        const ctx = document.getElementById('weightChart');
        if (!ctx) return;

        const weightHistory = userData.weightHistory || [];
        if (weightHistory.length === 0) {
            this.showNoDataMessage(ctx, 'No weight entries logged yet');
            return;
        }

        const labels = weightHistory.map(entry => this.formatChartDate(entry.date));
        const weights = weightHistory.map(entry => entry.weight);

        this.charts.weight = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Weight (kg)',
                    data: weights,
                    borderColor: '#B3DD24',
                    backgroundColor: 'rgba(179, 221, 36, 0.15)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: '#B3DD24',
                    pointBorderColor: '#000000',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: this.getThemeScaleOptions({ beginAtZero: false })
            }
        });
    }

    createWaterChart(userData) {
        const ctx = document.getElementById('waterChart');
        if (!ctx) return;

        const waterHistory = userData.waterHistory || [];
        const waterGoal = userData.profile.waterGoal || 2.5;

        if (waterHistory.length === 0) {
            this.showNoDataMessage(ctx, 'No hydration entries recorded');
            return;
        }

        const last7Days = this.getLast7Days();
        const labels = last7Days.map(day => this.formatChartDate(day));
        const waterData = last7Days.map(day => {
            const entry = waterHistory.find(w => w.date === day);
            return entry ? entry.waterIntake : 0;
        });

        this.charts.water = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Water (L)',
                        data: waterData,
                        backgroundColor: '#B3DD24',
                        borderColor: '#B3DD24',
                        borderWidth: 1,
                        borderRadius: 6
                    },
                    {
                        label: 'Daily Target',
                        data: new Array(7).fill(waterGoal),
                        type: 'line',
                        borderColor: '#FFFFFF',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 0,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: '#999999', boxWidth: 12 }
                    }
                },
                scales: this.getThemeScaleOptions({
                    beginAtZero: true,
                    max: Math.max(waterGoal * 1.4, Math.max(...waterData, 0) * 1.2)
                })
            }
        });
    }

    createCalorieChart(userData) {
        const ctx = document.getElementById('calorieChart');
        if (!ctx) return;

        const calorieHistory = userData.calorieHistory || [];
        const calorieGoal = userData.profile.calorieGoal || 2000;

        if (calorieHistory.length === 0) {
            this.showNoDataMessage(ctx, 'No calorie entries recorded');
            return;
        }

        const last7Days = this.getLast7Days();
        const labels = last7Days.map(day => this.formatChartDate(day));
        const calorieData = last7Days.map(day => {
            const entry = calorieHistory.find(c => c.date === day);
            return entry ? entry.caloriesConsumed : 0;
        });

        this.charts.calorie = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Calories (kcal)',
                        data: calorieData,
                        backgroundColor: 'rgba(179, 221, 36, 0.85)',
                        borderColor: '#B3DD24',
                        borderWidth: 1,
                        borderRadius: 6
                    },
                    {
                        label: 'Target (kcal)',
                        data: new Array(7).fill(calorieGoal),
                        type: 'line',
                        borderColor: '#EF4444',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 0,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: '#999999', boxWidth: 12 }
                    }
                },
                scales: this.getThemeScaleOptions({
                    beginAtZero: true,
                    max: Math.max(calorieGoal * 1.3, Math.max(...calorieData, 0) * 1.15)
                })
            }
        });
    }

    createWorkoutChart(userData) {
        const ctx = document.getElementById('workoutChart');
        if (!ctx) return;

        const workoutHistory = userData.workoutHistory || [];
        const workoutGoal = userData.profile.workoutDays || 3;

        if (workoutHistory.length === 0) {
            this.showNoDataMessage(ctx, 'No workouts recorded yet');
            return;
        }

        const last4Weeks = this.getLast4Weeks();
        const labels = last4Weeks.map(week => `Week ${week.weekNumber}`);
        const workoutData = last4Weeks.map(week => {
            const entries = workoutHistory.filter(w => {
                const entryDate = new Date(w.date);
                return entryDate >= new Date(week.startDate) && entryDate <= new Date(week.endDate);
            });
            return entries.length;
        });

        this.charts.workout = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Workouts Completed',
                        data: workoutData,
                        backgroundColor: '#B3DD24',
                        borderColor: '#B3DD24',
                        borderWidth: 1,
                        borderRadius: 6
                    },
                    {
                        label: 'Weekly Target',
                        data: new Array(4).fill(workoutGoal),
                        type: 'line',
                        borderColor: '#FFFFFF',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 0,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: '#999999', boxWidth: 12 }
                    }
                },
                scales: this.getThemeScaleOptions({
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                })
            }
        });
    }

    createExerciseChart(userData) {
        const ctx = document.getElementById('exerciseChart');
        if (!ctx) return;

        const exerciseHistory = userData.exerciseHistory || [];
        if (exerciseHistory.length === 0) {
            this.showNoDataMessage(ctx, 'No exercise sets logged yet');
            return;
        }

        const exerciseGroups = {};
        exerciseHistory.forEach(entry => {
            if (!exerciseGroups[entry.exerciseName]) {
                exerciseGroups[entry.exerciseName] = [];
            }
            exerciseGroups[entry.exerciseName].push({
                date: entry.date,
                volume: entry.totalVolume
            });
        });

        const topExercises = Object.keys(exerciseGroups)
            .map(exerciseName => ({
                name: exerciseName,
                totalVolume: exerciseGroups[exerciseName].reduce((sum, entry) => sum + entry.volume, 0)
            }))
            .sort((a, b) => b.totalVolume - a.totalVolume)
            .slice(0, 4);

        if (topExercises.length === 0) {
            this.showNoDataMessage(ctx, 'No exercise data available');
            return;
        }

        const last30Days = this.getLast30Days();
        const labels = last30Days.map(day => this.formatChartDate(day));
        const colors = ['#B3DD24', '#FFFFFF', '#10B981', '#FF9F43'];

        const datasets = topExercises.map((exercise, index) => {
            const color = colors[index % colors.length];
            const data = last30Days.map(day => {
                const entry = exerciseGroups[exercise.name].find(e => e.date === day);
                return entry ? entry.volume : 0;
            });

            return {
                label: exercise.name,
                data: data,
                borderColor: color,
                backgroundColor: color + '15',
                borderWidth: 2.5,
                fill: false,
                tension: 0.35,
                pointRadius: 3,
                pointHoverRadius: 6
            };
        });

        this.charts.exercise = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: '#999999', boxWidth: 12 }
                    }
                },
                scales: this.getThemeScaleOptions({
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Total Volume (kg)',
                        color: '#999999',
                        font: { family: "'Outfit', sans-serif", size: 12 }
                    }
                })
            }
        });
    }

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    }

    getLast30Days() {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    }

    getLast4Weeks() {
        const weeks = [];
        for (let i = 3; i >= 0; i--) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() - (i * 7));
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 6);
            
            weeks.push({
                weekNumber: 4 - i,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            });
        }
        return weeks;
    }

    formatChartDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    showNoDataMessage(canvas, message) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666666';
        ctx.font = '14px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    }

    // Modal Interaction
    addChartInteractions() {
        const chartTypes = ['weight', 'water', 'calorie', 'workout', 'exercise'];
        chartTypes.forEach(chartType => {
            const container = document.getElementById(chartType + 'Chart')?.closest('.chart-container');
            if (container) {
                container.onclick = (e) => {
                    e.stopPropagation();
                    this.showChartModal(chartType);
                };
            }
        });
    }

    showChartModal(chartType) {
        const modal = document.getElementById('chartModal');
        const modalTitle = document.getElementById('modalChartTitle');
        const modalCanvas = document.getElementById('modalChart');
        if (!modal || !modalTitle || !modalCanvas) return;

        const titles = {
            weight: 'Weight Progression History',
            water: 'Hydration Target Analysis',
            calorie: 'Caloric Intake & Energy Balance',
            workout: 'Workout Consistency & Frequency',
            exercise: 'Exercise Volume Progression'
        };

        modalTitle.textContent = titles[chartType] || 'Performance Graph';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            this.createModalChart(chartType);
        }, 100);

        document.addEventListener('keydown', this.handleEscapeKey);
    }

    handleEscapeKey = (event) => {
        if (event.key === 'Escape') {
            this.closeModal();
        }
    }

    closeModal() {
        const modal = document.getElementById('chartModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
        if (this.modalChart && typeof this.modalChart.destroy === 'function') {
            this.modalChart.destroy();
            this.modalChart = null;
        }
        document.removeEventListener('keydown', this.handleEscapeKey);
    }

    createModalChart(chartType) {
        const modalCanvas = document.getElementById('modalChart');
        if (!modalCanvas) return;

        if (this.modalChart && typeof this.modalChart.destroy === 'function') {
            this.modalChart.destroy();
        }

        const userData = window.dashboardManager ? window.dashboardManager.currentUser : null;
        if (!userData) return;

        switch (chartType) {
            case 'weight':
                this.createModalWeightChart(userData, modalCanvas);
                break;
            case 'water':
                this.createModalWaterChart(userData, modalCanvas);
                break;
            case 'calorie':
                this.createModalCalorieChart(userData, modalCanvas);
                break;
            case 'workout':
                this.createModalWorkoutChart(userData, modalCanvas);
                break;
            case 'exercise':
                this.createModalExerciseChart(userData, modalCanvas);
                break;
        }
    }

    createModalWeightChart(userData, canvas) {
        const weightHistory = userData.weightHistory || [];
        if (weightHistory.length === 0) {
            this.showNoDataMessage(canvas, 'No weight data available');
            return;
        }
        const labels = weightHistory.map(entry => this.formatChartDate(entry.date));
        const weights = weightHistory.map(entry => entry.weight);

        this.modalChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Weight (kg)',
                    data: weights,
                    borderColor: '#B3DD24',
                    backgroundColor: 'rgba(179, 221, 36, 0.15)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: '#B3DD24',
                    pointBorderColor: '#000000',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: this.getThemeScaleOptions({ beginAtZero: false })
            }
        });
    }

    createModalWaterChart(userData, canvas) {
        const waterHistory = userData.waterHistory || [];
        const waterGoal = userData.profile.waterGoal || 2.5;
        if (waterHistory.length === 0) {
            this.showNoDataMessage(canvas, 'No water data available');
            return;
        }
        const last7Days = this.getLast7Days();
        const labels = last7Days.map(day => this.formatChartDate(day));
        const waterData = last7Days.map(day => {
            const entry = waterHistory.find(w => w.date === day);
            return entry ? entry.waterIntake : 0;
        });

        this.modalChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Water Intake (L)',
                        data: waterData,
                        backgroundColor: '#B3DD24',
                        borderColor: '#B3DD24',
                        borderWidth: 2,
                        borderRadius: 8
                    },
                    {
                        label: 'Daily Goal',
                        data: new Array(7).fill(waterGoal),
                        type: 'line',
                        borderColor: '#FFFFFF',
                        borderWidth: 2.5,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: this.getThemeScaleOptions({ beginAtZero: true })
            }
        });
    }

    createModalCalorieChart(userData, canvas) {
        const calorieHistory = userData.calorieHistory || [];
        const calorieGoal = userData.profile.calorieGoal || 2000;
        if (calorieHistory.length === 0) {
            this.showNoDataMessage(canvas, 'No calorie data available');
            return;
        }
        const last7Days = this.getLast7Days();
        const labels = last7Days.map(day => this.formatChartDate(day));
        const calorieData = last7Days.map(day => {
            const entry = calorieHistory.find(c => c.date === day);
            return entry ? entry.caloriesConsumed : 0;
        });

        this.modalChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Calories Consumed',
                        data: calorieData,
                        backgroundColor: 'rgba(179, 221, 36, 0.85)',
                        borderColor: '#B3DD24',
                        borderWidth: 2,
                        borderRadius: 8
                    },
                    {
                        label: 'Daily Target',
                        data: new Array(7).fill(calorieGoal),
                        type: 'line',
                        borderColor: '#EF4444',
                        borderWidth: 2.5,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: this.getThemeScaleOptions({ beginAtZero: true })
            }
        });
    }

    createModalWorkoutChart(userData, canvas) {
        const workoutHistory = userData.workoutHistory || [];
        const workoutGoal = userData.profile.workoutDays || 3;
        if (workoutHistory.length === 0) {
            this.showNoDataMessage(canvas, 'No workout data available');
            return;
        }
        const last4Weeks = this.getLast4Weeks();
        const labels = last4Weeks.map(week => `Week ${week.weekNumber}`);
        const workoutData = last4Weeks.map(week => {
            const entries = workoutHistory.filter(w => {
                const entryDate = new Date(w.date);
                return entryDate >= new Date(week.startDate) && entryDate <= new Date(week.endDate);
            });
            return entries.length;
        });

        this.modalChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Workouts Completed',
                        data: workoutData,
                        backgroundColor: '#B3DD24',
                        borderColor: '#B3DD24',
                        borderWidth: 2,
                        borderRadius: 8
                    },
                    {
                        label: 'Weekly Goal',
                        data: new Array(4).fill(workoutGoal),
                        type: 'line',
                        borderColor: '#FFFFFF',
                        borderWidth: 2.5,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: this.getThemeScaleOptions({ beginAtZero: true, ticks: { stepSize: 1 } })
            }
        });
    }

    createModalExerciseChart(userData, canvas) {
        const exerciseHistory = userData.exerciseHistory || [];
        if (exerciseHistory.length === 0) {
            this.showNoDataMessage(canvas, 'No exercise data available');
            return;
        }
        const exerciseGroups = {};
        exerciseHistory.forEach(entry => {
            if (!exerciseGroups[entry.exerciseName]) exerciseGroups[entry.exerciseName] = [];
            exerciseGroups[entry.exerciseName].push({ date: entry.date, volume: entry.totalVolume });
        });

        const topExercises = Object.keys(exerciseGroups)
            .map(exerciseName => ({
                name: exerciseName,
                totalVolume: exerciseGroups[exerciseName].reduce((sum, entry) => sum + entry.volume, 0)
            }))
            .sort((a, b) => b.totalVolume - a.totalVolume)
            .slice(0, 4);

        const last30Days = this.getLast30Days();
        const labels = last30Days.map(day => this.formatChartDate(day));
        const colors = ['#B3DD24', '#FFFFFF', '#10B981', '#FF9F43'];

        const datasets = topExercises.map((exercise, index) => {
            const color = colors[index % colors.length];
            const data = last30Days.map(day => {
                const entry = exerciseGroups[exercise.name].find(e => e.date === day);
                return entry ? entry.volume : 0;
            });
            return {
                label: exercise.name,
                data: data,
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 5
            };
        });

        this.modalChart = new Chart(canvas, {
            type: 'line',
            data: { labels: labels, datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: this.getThemeScaleOptions({ beginAtZero: true })
            }
        });
    }
}

function initCharts() {
    if (!window.chartManager) {
        window.chartManager = new ChartManager();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCharts);
} else {
    initCharts();
}

function closeChartModal() {
    if (window.chartManager) {
        window.chartManager.closeModal();
    }
}
