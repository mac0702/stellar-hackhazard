import { Web3Service } from './web3Service';

interface User {
    id: string;
    name: string;
    email: string;
    walletAddress?: string;
    role: 'user' | 'admin';
    createdAt: Date;
}

interface AuthResponse {
    user: User;
    token: string;
}

export class AuthService {
    private currentUser: User | null = null;
    private token: string | null = null;

    constructor(private web3Service: Web3Service) {
        this.checkExistingSession();
    }

    private checkExistingSession() {
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('user');
        if (token && user) {
            this.token = token;
            this.currentUser = JSON.parse(user);
        }
    }

    async register(data: {
        name: string;
        email: string;
        password: string;
        walletAddress?: string;
    }): Promise<AuthResponse> {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const auth: AuthResponse = await response.json();
            this.setSession(auth);
            return auth;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const auth: AuthResponse = await response.json();
            this.setSession(auth);
            return auth;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async loginWithMetaMask(): Promise<AuthResponse> {
        try {
            const address = await this.web3Service.connectWallet();
            const message = `Sign this message to login to AidLink: ${Date.now()}`;
            const signature = await this.web3Service.signMessage(message);

            const response = await fetch('/api/auth/metamask-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address,
                    message,
                    signature,
                }),
            });

            if (!response.ok) {
                throw new Error('MetaMask login failed');
            }

            const auth: AuthResponse = await response.json();
            this.setSession(auth);
            return auth;
        } catch (error) {
            console.error('MetaMask login error:', error);
            throw error;
        }
    }

    async linkWallet(): Promise<void> {
        if (!this.currentUser || !this.token) {
            throw new Error('User not logged in');
        }

        try {
            const address = await this.web3Service.connectWallet();
            const message = `Link this wallet to your AidLink account: ${Date.now()}`;
            const signature = await this.web3Service.signMessage(message);

            const response = await fetch('/api/auth/link-wallet', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address,
                    message,
                    signature,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to link wallet');
            }

            const updatedUser = await response.json();
            this.currentUser = updatedUser;
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Wallet linking error:', error);
            throw error;
        }
    }

    logout(): void {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }

    private setSession(auth: AuthResponse): void {
        this.currentUser = auth.user;
        this.token = auth.token;
        localStorage.setItem('auth_token', auth.token);
        localStorage.setItem('user', JSON.stringify(auth.user));
    }

    isAuthenticated(): boolean {
        return !!this.token && !!this.currentUser;
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }

    getToken(): string | null {
        return this.token;
    }
}