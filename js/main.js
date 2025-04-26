// Main application logic
class AidLinkApp {
    constructor() {
        this.web3 = null;
        this.web3Service = null;
        this.authService = null;
        this.accounts = [];
        this.initializeApp();
        this.setupEventListeners();
        this.updateDashboard();
        this.initializeWeb3();
        this.initializeDonationHandlers();
        this.initializeAuth();
    }

    async initializeWeb3() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Initialize Web3 instance
                this.web3 = new Web3(window.ethereum);
                
                // Initialize Web3Service with contract addresses
                this.web3Service = new Web3Service(
                    process.env.AID_TOKEN_ADDRESS,
                    process.env.DONATION_MANAGER_ADDRESS
                );
                
                // Handle account changes
                window.ethereum.on('accountsChanged', (accounts) => {
                    this.handleAccountsChanged(accounts);
                });

                // Handle chain changes
                window.ethereum.on('chainChanged', (_chainId) => {
                    window.location.reload();
                });

                // Subscribe to blockchain events
                this.web3Service.subscribeToEvents((event) => {
                    this.handleBlockchainEvent(event);
                });

                // Check if already connected
                const accounts = await this.web3.eth.getAccounts();
                if (accounts.length > 0) {
                    this.handleAccountsChanged(accounts);
                }

                this.updateConnectionStatus('MetaMask detected');
            } catch (error) {
                console.error('Error initializing Web3:', error);
                this.updateConnectionStatus('Error connecting to MetaMask');
            }
        } else {
            this.updateConnectionStatus('Please install MetaMask');
        }
    }

    async handleBlockchainEvent(event) {
        console.log('Blockchain event:', event);
        
        // Update UI based on event type
        if (event.event === 'DonationReceived') {
            this.updateDonationStats(event.returnValues);
        } else if (event.event === 'FundsDistributed') {
            this.updateDistributionStats(event.returnValues);
        }
        
        // Refresh dashboard
        await this.updateDashboard();
    }

    async connectWallet() {
        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            this.handleAccountsChanged(accounts);
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
        }
    }

    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.updateConnectionStatus('Please connect to MetaMask');
        } else {
            this.accounts = accounts;
            this.updateWalletDisplay(accounts[0]);
            this.updateConnectionStatus('Connected');
        }
    }

    updateWalletDisplay(account) {
        const walletAddress = document.getElementById('walletAddress');
        walletAddress.textContent = account ? 
            `${account.slice(0, 6)}...${account.slice(-4)}` : '';
    }

    updateConnectionStatus(status) {
        const connectionStatus = document.getElementById('connectionStatus');
        connectionStatus.textContent = status;
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

        // Add wallet connection listener
        document.getElementById('connectWallet').addEventListener('click', () => {
            this.connectWallet();
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

    async updateDashboard() {
        try {
            // Get contract balance
            const balance = await this.web3Service.getContractBalance();
            
            // Update stats
            this.stats = {
                totalAid: parseFloat(balance),
                activeVendors: await this.getActiveVendorsCount(),
                beneficiaries: await this.getBeneficiariesCount()
            };

            // Update UI
            document.getElementById('totalAid').textContent = 
                this.stats.totalAid.toLocaleString() + ' ETH';
            document.getElementById('activeVendors').textContent = 
                this.stats.activeVendors;
            document.getElementById('beneficiaries').textContent = 
                this.stats.beneficiaries;
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }

    async initializeDonationHandlers() {
        document.querySelectorAll('.donate-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                if (!this.web3Service || !this.accounts.length) {
                    alert('Please connect your wallet first');
                    return;
                }

                const needCard = e.target.closest('.aid-need-card');
                const title = needCard.querySelector('h3').textContent;
                const category = needCard.querySelector('.need-tag').textContent;
                const region = needCard.querySelector('.need-stat i.fa-map-marker-alt')
                    .nextSibling.textContent.trim();
                
                try {
                    // Get donation amount from user
                    const amount = prompt('Enter donation amount in ETH:', '0.1');
                    if (!amount) return;

                    // Create donation transaction
                    const result = await this.web3Service.donate(amount, category, region);
                    
                    // Update UI
                    alert(`Thank you for your donation! Transaction hash: ${result.transactionHash}`);
                    
                    // Update progress bar
                    const progressBar = needCard.querySelector('.progress');
                    const progressText = needCard.querySelector('.progress-text');
                    const currentProgress = parseInt(progressText.textContent);
                    const newProgress = Math.min(currentProgress + 5, 100);
                    
                    progressBar.style.width = `${newProgress}%`;
                    progressText.textContent = `${newProgress}% Funded`;
                    
                } catch (error) {
                    console.error('Error processing donation:', error);
                    alert('Error processing donation. Please try again.');
                }
            });
        });
    }

    initializeAuth() {
        this.authService = new AuthService(this.web3Service);
        this.updateAuthUI();
        this.setupAuthListeners();
    }

    updateAuthUI() {
        const isAuthenticated = this.authService.isAuthenticated();
        const guestButtons = document.querySelector('.guest-buttons');
        const userProfile = document.querySelector('.user-profile');
        const user = this.authService.getCurrentUser();

        if (isAuthenticated && user) {
            guestButtons.style.display = 'none';
            userProfile.style.display = 'flex';
            document.querySelector('.username').textContent = user.name;
            if (user.walletAddress) {
                this.updateWalletDisplay(user.walletAddress);
            }
        } else {
            guestButtons.style.display = 'flex';
            userProfile.style.display = 'none';
        }
    }

    setupAuthListeners() {
        // Login Modal
        document.getElementById('loginBtn').addEventListener('click', () => {
            document.getElementById('loginModal').style.display = 'block';
        });

        // Register Modal
        document.getElementById('registerBtn').addEventListener('click', () => {
            document.getElementById('registerModal').style.display = 'block';
        });

        // Switch between modals
        document.getElementById('switchToRegister').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('registerModal').style.display = 'block';
        });

        document.getElementById('switchToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('registerModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'block';
        });

        // Login Form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                await this.authService.login(email, password);
                document.getElementById('loginModal').style.display = 'none';
                this.updateAuthUI();
            } catch (error) {
                alert('Login failed. Please try again.');
            }
        });

        // Register Form
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            try {
                await this.authService.register({ name, email, password });
                document.getElementById('registerModal').style.display = 'none';
                this.updateAuthUI();
            } catch (error) {
                alert('Registration failed. Please try again.');
            }
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.authService.logout();
            this.updateAuthUI();
        });

        // MetaMask Login Buttons
        document.querySelectorAll('.metamask-btn').forEach(button => {
            button.addEventListener('click', async () => {
                try {
                    await this.authService.loginWithMetaMask();
                    document.querySelectorAll('.modal').forEach(modal => {
                        modal.style.display = 'none';
                    });
                    this.updateAuthUI();
                } catch (error) {
                    alert('MetaMask login failed. Please try again.');
                }
            });
        });
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
