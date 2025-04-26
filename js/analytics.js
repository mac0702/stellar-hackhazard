class ImpactAnalytics {
    constructor() {
        this.charts = new Map();
        this.metrics = this.getMockData();
        this.setupEventListeners();
        this.initializeCharts();
    }

    getMockData() {
        return {
            totalAidDistributed: 1250.45,
            beneficiariesReached: 3500,
            vendorParticipation: {
                active: 45,
                total: 50
            },
            geographicCoverage: {
                totalArea: 2500,
                regions: new Map([
                    ['North', 800],
                    ['South', 600],
                    ['East', 700],
                    ['West', 400]
                ])
            },
            categoryCoverage: {
                food: 450.5,
                medical: 350.25,
                shelter: 250.75,
                education: 150.25,
                water: 48.7
            }
        };
    }

    setupEventListeners() {
        // Report generation
        document.getElementById('generateReport').addEventListener('click', () => {
            this.generateReport();
        });

        // Date range selection
        document.getElementById('dateRange').addEventListener('change', () => {
            this.updateAnalytics();
        });

        // Metrics selection
        document.getElementById('metricsSelector').addEventListener('change', () => {
            this.updateCharts();
        });
    }

    async initializeCharts() {
        const ctx = document.getElementById('distributionChart').getContext('2d');
        
        this.charts.set('distribution', new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Food', 'Medical', 'Shelter', 'Education', 'Water'],
                datasets: [{
                    label: 'Aid Distribution by Category (ETH)',
                    data: [
                        this.metrics.categoryCoverage.food,
                        this.metrics.categoryCoverage.medical,
                        this.metrics.categoryCoverage.shelter,
                        this.metrics.categoryCoverage.education,
                        this.metrics.categoryCoverage.water
                    ],
                    backgroundColor: [
                        'rgba(67, 97, 238, 0.6)',
                        'rgba(247, 37, 133, 0.6)',
                        'rgba(76, 201, 240, 0.6)',
                        'rgba(114, 9, 183, 0.6)',
                        'rgba(249, 199, 79, 0.6)'
                    ],
                    borderColor: [
                        'rgb(67, 97, 238)',
                        'rgb(247, 37, 133)',
                        'rgb(76, 201, 240)',
                        'rgb(114, 9, 183)',
                        'rgb(249, 199, 79)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Aid Distribution Analysis'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (ETH)'
                        }
                    }
                }
            }
        }));

        this.updateMetricsDisplay();
    }

    async updateAnalytics() {
        try {
            // For now, we'll just refresh with mock data
            // In production, this would fetch real data from the blockchain
            this.metrics = this.getMockData();
            this.updateCharts();
            this.updateMetricsDisplay();
        } catch (error) {
            console.error('Error updating analytics:', error);
            this.showAlert('Error updating analytics', 'error');
        }
    }

    updateCharts() {
        if (!this.metrics) return;

        // Update distribution chart
        const distributionChart = this.charts.get('distribution');
        distributionChart.data.datasets[0].data = [
            this.metrics.categoryCoverage.food,
            this.metrics.categoryCoverage.medical,
            this.metrics.categoryCoverage.shelter,
            this.metrics.categoryCoverage.education,
            this.metrics.categoryCoverage.water
        ];
        distributionChart.update();
    }

    updateMetricsDisplay() {
        const metricsContainer = document.querySelector('.metrics-container');
        metricsContainer.innerHTML = `
            <div class="metric-card">
                <h3>Total Aid Distributed</h3>
                <p>${this.metrics.totalAidDistributed.toFixed(2)} ETH</p>
            </div>
            <div class="metric-card">
                <h3>Beneficiaries Reached</h3>
                <p>${this.metrics.beneficiariesReached.toLocaleString()}</p>
            </div>
            <div class="metric-card">
                <h3>Active Vendors</h3>
                <p>${this.metrics.vendorParticipation.active}</p>
            </div>
            <div class="metric-card">
                <h3>Geographic Coverage</h3>
                <p>${this.metrics.geographicCoverage.totalArea.toLocaleString()} km²</p>
            </div>
        `;
    }

    async generateReport() {
        if (!this.metrics) {
            this.showAlert('No data available for report generation', 'error');
            return;
        }

        try {
            // Generate PDF report
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Title
            doc.setFontSize(20);
            doc.text('AidLink Impact Analysis Report', 20, 20);
            
            // Date Range
            doc.setFontSize(12);
            const dateRange = document.getElementById('dateRange');
            doc.text(`Period: ${dateRange.options[dateRange.selectedIndex].text}`, 20, 30);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);

            // Key Metrics
            doc.setFontSize(16);
            doc.text('Key Metrics', 20, 45);
            
            doc.setFontSize(12);
            doc.text(`Total Aid Distributed: ${this.metrics.totalAidDistributed.toFixed(2)} ETH`, 25, 55);
            doc.text(`Beneficiaries Reached: ${this.metrics.beneficiariesReached.toLocaleString()}`, 25, 65);
            doc.text(`Active Vendors: ${this.metrics.vendorParticipation.active}`, 25, 75);
            doc.text(`Geographic Coverage: ${this.metrics.geographicCoverage.totalArea.toLocaleString()} km²`, 25, 85);

            // Category Distribution
            doc.setFontSize(16);
            doc.text('Aid Distribution by Category', 20, 100);
            
            doc.setFontSize(12);
            let y = 110;
            Object.entries(this.metrics.categoryCoverage).forEach(([category, amount]) => {
                doc.text(`${category.charAt(0).toUpperCase() + category.slice(1)}: ${amount.toFixed(2)} ETH`, 25, y);
                y += 10;
            });

            // Geographic Distribution
            doc.setFontSize(16);
            doc.text('Geographic Distribution', 20, y + 10);
            
            doc.setFontSize(12);
            y += 20;
            this.metrics.geographicCoverage.regions.forEach((amount, region) => {
                doc.text(`${region}: ${amount.toLocaleString()} km²`, 25, y);
                y += 10;
            });

            // Add chart
            const distributionChart = document.getElementById('distributionChart');
            const chartImage = distributionChart.toDataURL('image/png');
            doc.addImage(chartImage, 'PNG', 20, y, 170, 100);

            // Save the PDF
            const fileName = `impact-report-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            // Also generate CSV for raw data
            this.exportCSV();

            this.showAlert('Report generated successfully!', 'success');
        } catch (error) {
            console.error('Error generating report:', error);
            this.showAlert('Error generating report', 'error');
        }
    }

    exportCSV() {
        const data = [
            ['Metric', 'Value'],
            ['Total Aid Distributed', this.metrics.totalAidDistributed],
            ['Beneficiaries Reached', this.metrics.beneficiariesReached],
            ['Active Vendors', this.metrics.vendorParticipation.active],
            ['Total Vendors', this.metrics.vendorParticipation.total],
            ['Geographic Coverage (km²)', this.metrics.geographicCoverage.totalArea]
        ];

        // Add category distribution
        Object.entries(this.metrics.categoryCoverage).forEach(([category, amount]) => {
            data.push([`Category - ${category}`, amount]);
        });

        // Add geographic distribution
        this.metrics.geographicCoverage.regions.forEach((amount, region) => {
            data.push([`Region - ${region}`, amount]);
        });

        const csvContent = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `impact-data-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        document.body.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// Initialize analytics when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new ImpactAnalytics();
});