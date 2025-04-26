// Main application logic
class AidLinkApp {
    constructor() {
        this.initializeApp();
        this.setupEventListeners();
        this.updateDashboard();
    }

    initializeApp() {
        console.log('Initializing AidLink Application...');
        // Initialize dashboard counters
        this.stats = {
            totalAid: 0,
            activeVendors: 0,
            beneficiaries: 0
        };
    }

    setupEventListeners() {
        // Setup navigation
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                this.navigateToSection(sectionId);
            });
        });

        // Setup modal triggers
        document.getElementById('createToken').addEventListener('click', () => {
            this.openModal('tokenModal');
        });

        // Setup form submissions
        document.getElementById('tokenForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTokenCreation(e);
        });
    }

    navigateToSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('main section').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        document.getElementById(sectionId).style.display = 'block';
    }

    openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    handleTokenCreation(event) {
        const formData = new FormData(event.target);
        const tokenData = {
            recipient: formData.get('recipient'),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category')
        };

        // Create token logic here
        console.log('Creating token:', tokenData);
        this.closeModal('tokenModal');
        this.updateDashboard();
    }

    updateDashboard() {
        // Update dashboard statistics
        document.getElementById('totalAid').textContent = this.stats.totalAid.toLocaleString();
        document.getElementById('activeVendors').textContent = this.stats.activeVendors;
        document.getElementById('beneficiaries').textContent = this.stats.beneficiaries;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aidLinkApp = new AidLinkApp();
});

// Helper function for closing modals
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}