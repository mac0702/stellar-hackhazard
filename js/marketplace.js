class Marketplace {
    constructor() {
        this.vendors = new Map();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('registerVendor').addEventListener('click', () => {
            this.showVendorRegistrationForm();
        });
    }

    showVendorRegistrationForm() {
        const form = `
            <div class="vendor-registration-form">
                <h3>Register New Vendor</h3>
                <form id="vendorForm">
                    <div class="form-group">
                        <label for="vendorName">Vendor Name</label>
                        <input type="text" id="vendorName" required>
                    </div>
                    <div class="form-group">
                        <label for="vendorCategory">Category</label>
                        <select id="vendorCategory" multiple required>
                            <option value="food">Food</option>
                            <option value="medical">Medical</option>
                            <option value="shelter">Shelter</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="vendorLocation">Location</label>
                        <input type="text" id="vendorLocation" required>
                    </div>
                    <button type="submit" class="btn primary">Register</button>
                </form>
            </div>
        `;

        const vendorsList = document.getElementById('vendorsList');
        vendorsList.insertAdjacentHTML('beforebegin', form);

        document.getElementById('vendorForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registerVendor(e);
        });
    }

    registerVendor(event) {
        const formData = new FormData(event.target);
        const vendor = {
            id: this.generateVendorId(),
            name: formData.get('vendorName'),
            categories: Array.from(formData.getAll('vendorCategory')),
            location: formData.get('vendorLocation'),
            rating: 5.0,
            registeredAt: new Date()
        };

        this.vendors.set(vendor.id, vendor);
        this.renderVendor(vendor);
        event.target.reset();
        document.querySelector('.vendor-registration-form').remove();
    }

    renderVendor(vendor) {
        const vendorsList = document.getElementById('vendorsList');
        const vendorElement = document.createElement('div');
        vendorElement.className = 'vendor-card';
        vendorElement.innerHTML = `
            <h3>${vendor.name}</h3>
            <p>Categories: ${vendor.categories.join(', ')}</p>
            <p>Location: ${vendor.location}</p>
            <p>Rating: ${vendor.rating}</p>
            <button onclick="marketplace.viewVendorDetails('${vendor.id}')" class="btn secondary">View Details</button>
        `;
        vendorsList.appendChild(vendorElement);
    }

    viewVendorDetails(vendorId) {
        const vendor = this.vendors.get(vendorId);
        if (vendor) {
            // Implement vendor details view
            console.log(`Viewing details for vendor ${vendorId}`);
        }
    }

    generateVendorId() {
        return `VEN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Initialize Marketplace when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.marketplace = new Marketplace();
});