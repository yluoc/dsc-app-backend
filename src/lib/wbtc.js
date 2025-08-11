import {ethers} from 'ethers';
import { wBTCAddress, wBTCabi } from './abi/abi_constants'; 
import { 
  validateAddress, 
  formatAddress, 
  validateAmount, 
  validateNonNegativeAmount,
  formatAmountToWei,
  formatAmountFromWei,
  validatePrivateKey,
  sanitizePrivateKey,
  formatTransactionResult
} from './utils.js';

class WBTCService {
    constructor(provider) {
        this.provider = provider;
        this.contract = null;
        this.signer = null;
        this.initializeContract();
    }

    initializeContract() {
        try {
            this.contract = new ethers.Contract(wBTCAddress, wBTCabi, this.provider);
            console.log('wBTC service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize wBTC service:', error);
            throw error;
        }
    }

    // Set signer for transactions (requires private key)
    setSigner(privateKey) {
        if (!validatePrivateKey(privateKey)) {
            throw new Error('Invalid private key format');
        }

        try {
            this.signer = new ethers.Wallet(privateKey, this.provider);
            this.contract = this.contract.connect(this.signer);

            // console.log(`wBTC signer set for address: ${this.signer.address}`);
            return true;
        } catch (error) {
            console.error('Failed to set wBTC signer:', error);
            throw error;
        }
    }

    // Read-only operations
    async getTokenName() {
        try {
            return await this.contract.name();
        } catch (error) {
            console.error('Error getting wBTC token name:', error);
            throw error;
        } 
    }

    async getTokenSymbol() {
        try {
            return await this.contract.symbol();
        } catch (error) {
            console.error('Error getting wBTC token symbol:', error);
            throw error;
        }
    }

    async getTokenDecimals() {
        try {
            return await this.contract.decimals();
        } catch (error) {
            console.error('Error getting wBTC token decimals:', error);
            throw error;
        }
    }

    async getTokenTotalSupply() {
        try {
            const totalSupplyWei = await this.contract.totalSupply();
            return formatAmountFromWei(totalSupplyWei, await this.getTokenDecimals());
        } catch (error) {
            console.error('Error getting wBTC total supply:', error);
            throw error;
        }
    }

    async getTotalSupply() {
        try {
            const supply = await this.contract.totalSupply();
            return formatAmountFromWei(supply);
        } catch (error) {
            console.error('Error getting wETH total supply:', error);
            throw error;
        }
    }

    async getBalance(address) {
        try {
            const formattedAddress = formatAddress(address);
            const balance = await this.contract.balanceOf(formattedAddress);
            return formatAmountFromWei(balance);
        } catch (error) {
            console.error('Error getting wBTC balance:', error);
            throw error;
        }
    }

    async getAllowance(owner, spender) {
        try {
            const formattedOwner = formatAddress(owner);
            const formattedSpender = formatAddress(spender);
            const allowance = await this.contract.allowance(formattedOwner, formattedSpender);
            return formatAmountFromWei(allowance);
        } catch (error) {
            console.error('Error getting wBTC allowance:', error);
            throw error;
        }
    }

    async getBTCBalance(address) {
        try {
            const formattedAddress = formatAddress(address);
            const balance = await this.provider.getBalance(formattedAddress);
            return formatAmountFromWei(balance, 8); // BTC has 8 decimals
        } catch (error) {
            console.error('Error getting BTC balance:', error);
            throw error;
        }
    }

    async depositBTC(amount) {
        if (!this.signer) {
            throw new Error('Signer not set. Call setSigner() with a valid private key.');
        }

        if (!validateAmount(amount)) {
            throw new Error('Invalid amount format');
        }

        if (!validateNonNegativeAmount(amount)) {
            throw new Error('Amount must be non-negative');
        }
        try {
            const decimals = await this.getTokenDecimals();
            const amountInWei = formatAmountToWei(amount, decimals);

            const tx = await this.contract.deposit({ value: amountInWei });
            const receipt = await tx.wait();

            return formatTransactionResult(receipt);
        } catch (error) {
            console.error('Error depositing BTC:', error);
            throw error;
        }
    }

    async withdrawBTC(amount) {
        if (!this.signer) {
            throw new Error('Signer not set. Call setSigner() with a valid private key.');
        }

        if (!validateAmount(amount)) {
            throw new Error('Invalid amount format');
        }

        if (!validateNonNegativeAmount(amount)) {
            throw new Error('Amount must be non-negative');
        }

        try {
            const decimals = await this.getTokenDecimals();
            const amountInWei = formatAmountToWei(amount, decimals);

            const tx = await this.contract.withdraw(amountInWei);
            const receipt = await tx.wait();

            return formatTransactionResult(receipt);
        } catch (error) {
            console.error('Error withdrawing BTC:', error);
            throw error;
        }
    }

    async approve(spender, amount) {
        if (!this.signer) {
            throw new Error('Signer not set. Call setSigner() with a valid private key.');
        }

        if (!validateAddress(spender)) {
            throw new Error('Invalid spender address');
        }

        if (!validateAmount(amount)) {
            throw new Error('Invalid amount format');
        }

        if (!validateNonNegativeAmount(amount)) {
            throw new Error('Amount must be non-negative');
        }

        try {
            const formattedSpender = formatAddress(spender);
            const decimals = await this.getTokenDecimals();
            const amountInWei = formatAmountToWei(amount, decimals);

            const tx = await this.contract.approve(formattedSpender, amountInWei);
            const receipt = await tx.wait();

            return formatTransactionResult(receipt);
        } catch (error) {
            console.error('Error approving wBTC tokens:', error);
            throw error;
        }
    }

    async transfer(to, amount) {
        if (!this.signer) {
            throw new Error('Signer not set. Call setSigner() with a valid private key.');
        }

        if (!validateAddress(to)) {
            throw new Error('Invalid recipient address');
        }

        if (!validateAmount(amount)) {
            throw new Error('Invalid amount format');
        }

        if (!validateNonNegativeAmount(amount)) {
            throw new Error('Amount must be non-negative');
        }

        try {
            const formattedTo = formatAddress(to);
            const decimals = await this.getTokenDecimals();
            const amountInWei = formatAmountToWei(amount, decimals);

            const tx = await this.contract.transfer(formattedTo, amountInWei);
            const receipt = await tx.wait();

            return formatTransactionResult(receipt);
        } catch (error) {
            console.error('Error transferring wBTC tokens:', error);
            throw error;
        }
    }

    async depositBTCAndApprove(btcAmount, spender, approveAmount = null) {
        if (!this.signer) {
                throw new Error('Signer not set. Call setSigner() with a valid private key.');
        }

        try {
            // Deposit BTC
            const depositResult = await this.depositBTC(btcAmount);

            // Approve tokens if spender is provided
            let approveResult = null;
            if (spender) {
                const amountToApprove = approveAmount !== null ? approveAmount : btcAmount;
                approveResult = await this.approve(spender, amountToApprove);
            }

            return {
                deposit: depositResult,
                approve: approveResult,
                totalBTCDeposited: btcAmount,
                totalWBTCApproved: amountToApprove,
                spender: formatAddress(spender)
            };
        } catch (error) {
            console.error('Error in depositBTCAndApprove:', error);
            throw error;
        }
    }
}

export default WBTCService;