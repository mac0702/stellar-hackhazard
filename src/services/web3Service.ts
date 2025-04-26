import Web3 from 'web3';
import AidTokenABI from '../contracts/AidToken.json';
import DonationManagerABI from '../contracts/DonationManager.json';

export class Web3Service {
    private web3: Web3;
    private aidTokenContract: any;
    private donationManagerContract: any;
    private account: string | null = null;

    constructor(
        private aidTokenAddress: string,
        private donationManagerAddress: string
    ) {
        if (window.ethereum) {
            this.web3 = new Web3(window.ethereum);
            this.initializeContracts();
        } else {
            throw new Error('Please install MetaMask');
        }
    }

    private async initializeContracts() {
        this.aidTokenContract = new this.web3.eth.Contract(
            AidTokenABI,
            this.aidTokenAddress
        );
        this.donationManagerContract = new this.web3.eth.Contract(
            DonationManagerABI,
            this.donationManagerAddress
        );
    }

    async connectWallet(): Promise<string> {
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            this.account = accounts[0];
            return this.account;
        } catch (error) {
            throw new Error('Failed to connect wallet');
        }
    }

    async donate(amount: string, category: string, region: string): Promise<any> {
        if (!this.account) throw new Error('Wallet not connected');

        const weiAmount = this.web3.utils.toWei(amount, 'ether');
        return this.aidTokenContract.methods
            .donate(category, region)
            .send({
                from: this.account,
                value: weiAmount
            });
    }

    async getDonationHistory(donationId: number): Promise<any> {
        return this.aidTokenContract.methods
            .getDonation(donationId)
            .call();
    }

    async createMultiSigDonation(
        recipient: string,
        amount: string,
        purpose: string
    ): Promise<any> {
        if (!this.account) throw new Error('Wallet not connected');

        const weiAmount = this.web3.utils.toWei(amount, 'ether');
        return this.donationManagerContract.methods
            .createTransaction(recipient, weiAmount, purpose)
            .send({ from: this.account });
    }

    async approveMultiSigDonation(transactionId: number): Promise<any> {
        if (!this.account) throw new Error('Wallet not connected');

        return this.donationManagerContract.methods
            .approveTransaction(transactionId)
            .send({ from: this.account });
    }

    async getTransactionDetails(transactionId: number): Promise<any> {
        return this.donationManagerContract.methods
            .getTransaction(transactionId)
            .call();
    }

    async getContractBalance(): Promise<string> {
        const balance = await this.web3.eth.getBalance(this.aidTokenAddress);
        return this.web3.utils.fromWei(balance, 'ether');
    }

    async subscribeToEvents(callback: (event: any) => void) {
        this.aidTokenContract.events.DonationReceived({})
            .on('data', callback)
            .on('error', console.error);

        this.aidTokenContract.events.FundsDistributed({})
            .on('data', callback)
            .on('error', console.error);
    }
}