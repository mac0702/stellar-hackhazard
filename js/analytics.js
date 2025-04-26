class Analytics {
    constructor() {
        this.initializeCharts();
    }

    initializeCharts() {
        // Distribution Chart
        const ctx = document.getElementById('distributionChart').getContext('2d');
        this.distributionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Food', 'Medical', 'Shelter', 'Education', 'Transport'],
                datasets: [{
                    label: 'Aid Distribution by Category',
                    data: [12, 19, 3, 5, 2],
                    backgroundColor: [
                        'rgba(67, 97, 238, 0.7)',
                        'rgba(114, 9, 183, 0.7)',
                        'rgba(247, 37, 133, 0.7)',
                        'rgba(76, 201, 240, 0.7)',
                        'rgba(249, 199, 79, 0.7)'
                    ],
                    borderColor: [
                        'rgba(67, 97, 238, 1)',
                        'rgba(114, 9, 183, 1)',
                        'rgba(247, 37, 133, 1)',
                        'rgba(76, 201, 240, 1)',
                        'rgba(249, 199, 79, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Aid Distribution Overview',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    updateCharts(data) {
        // Animate the update
        this.distributionChart.data.datasets[0].data = data;
        this.distributionChart.update('active');
    }

    generateReport() {
        const metrics = {
            totalDistribution: 0,
            categoryBreakdown: {},
            impactScore: 0
        };

        // Calculate metrics
        this.distributionChart.data.datasets[0].data.forEach((value, index) => {
            const category = this.distributionChart.data.labels[index];
            metrics.totalDistribution += value;
            metrics.categoryBreakdown[category] = value;
        });

        return metrics;
    }
}

// Initialize Analytics when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new Analytics();
});