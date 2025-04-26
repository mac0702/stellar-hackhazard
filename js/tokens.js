class TokenManager {
    constructor() {
        this.tokens = new Map();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('tokenForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createToken(e);
        });
    }

    createToken(event) {
        const formData = new FormData(event.target);
        const token = {
            id: this.generateTokenId(),
            recipient: formData.get('recipient'),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            createdAt: new Date(),
            status: 'active'
        };

        this.tokens.set(token.id, token);
        this.renderToken(token);
        event.target.reset();
    }

    renderToken(token) {
        const tokensList = document.getElementById('tokensList');
        const tokenElement = document.createElement('div');
        tokenElement.className = 'token-card';
        tokenElement.innerHTML = `
            <h3>Token #${token.id}</h3>
            <p>Recipient: ${token.recipient}</p>
            <p>Amount: ${token.amount}</p>
            <p>Category: ${token.category}</p>
            <p>Status: ${token.status}</p>
            <button onclick="tokenManager.transferToken('${token.id}')" class="btn secondary">Transfer</button>
        `;
        tokensList.appendChild(tokenElement);
    }

    transferToken(tokenId) {
        const token = this.tokens.get(tokenId);
        if (token) {
            // Implement transfer logic here
            console.log(`Transferring token ${tokenId}`);
        }
    }

    generateTokenId() {
        return `TKN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Initialize TokenManager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tokenManager = new TokenManager();
});