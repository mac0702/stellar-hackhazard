class AuthHandler {
    constructor() {
        this.form = document.querySelector('.auth-form');
        this.web3 = null;
        this.initializeWeb3();
        this.setupEventListeners();
    }

    async initializeWeb3() {
        if (window.ethereum) {
            this.web3 = new Web3(window.ethereum);
        }
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const isLogin = window.location.pathname.includes('login');
            isLogin ? this.handleLogin(e) : this.handleSignup(e);
        });

        // Password visibility toggle
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = e.target.closest('.password-input').querySelector('input');
                const icon = e.target.querySelector('i');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });

        // MetaMask login/signup
        const metamaskBtn = document.querySelector('.metamask-btn');
        if (metamaskBtn) {
            metamaskBtn.addEventListener('click', () => {
                const isLogin = window.location.pathname.includes('login');
                isLogin ? this.handleMetaMaskLogin() : this.handleMetaMaskSignup();
            });
        }
    }

    async handleLogin(event) {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember')?.checked;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, remember }),
            });

            if (response.ok) {
                const data = await response.json();
                this.handleAuthSuccess(data);
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            this.showAlert('Invalid email or password', 'error');
        }
    }

    async handleSignup(event) {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            this.showAlert('Passwords do not match', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                this.showAlert('Registration successful! Please verify your email.', 'success');
                setTimeout(() => {
                    window.location.href = '/pages/auth/login.html';
                }, 2000);
            } else {
                throw new Error('Registration failed');
            }
        } catch (error) {
            this.showAlert('Registration failed. Please try again.', 'error');
        }
    }

    async handleMetaMaskLogin() {
        if (!this.web3) {
            this.showAlert('Please install MetaMask', 'error');
            return;
        }

        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            const account = accounts[0];
            
            // Sign message to verify ownership
            const message = `Login to AidLink: ${Date.now()}`;
            const signature = await this.web3.eth.personal.sign(message, account, '');

            const response = await fetch('/api/auth/metamask-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ account, message, signature }),
            });

            if (response.ok) {
                const data = await response.json();
                this.handleAuthSuccess(data);
            } else {
                throw new Error('MetaMask login failed');
            }
        } catch (error) {
            this.showAlert('MetaMask login failed', 'error');
        }
    }

    async handleMetaMaskSignup() {
        if (!this.web3) {
            this.showAlert('Please install MetaMask', 'error');
            return;
        }

        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            const account = accounts[0];
            
            // Sign message to verify ownership
            const message = `Register with AidLink: ${Date.now()}`;
            const signature = await this.web3.eth.personal.sign(message, account, '');

            const response = await fetch('/api/auth/metamask-register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ account, message, signature }),
            });

            if (response.ok) {
                const data = await response.json();
                this.showAlert('Registration successful!', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                throw new Error('MetaMask registration failed');
            }
        } catch (error) {
            this.showAlert('MetaMask registration failed', 'error');
        }
    }

    handleAuthSuccess(data) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
    }

    showAlert(message, type) {
        const alert = document.getElementById('authAlert');
        alert.textContent = message;
        alert.className = `auth-alert ${type}`;
        alert.style.display = 'block';

        setTimeout(() => {
            alert.style.display = 'none';
        }, 5000);
    }
}

// Initialize auth handler when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthHandler();
});