import { ethers } from 'ethers';
import { wETHAddress, wETHabi } from './abi/abi_constants.js';
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

class WETHService {
  constructor(provider) {
    this.provider = provider;
    this.contract = null;
    this.signer = null;
    this.initializeContract();
  }

  initializeContract() {
    try {
      this.contract = new ethers.Contract(wETHAddress, wETHabi, this.provider);
      console.log('wETH service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize wETH service:', error);
      throw error;
    }
  }

  // Set signer for transactions (requires private key)
  setSigner(privateKey) {
    try {
      if (!validatePrivateKey(privateKey)) {
        throw new Error('Invalid private key format');
      }
      
      this.signer = new ethers.Wallet(privateKey, this.provider);
      this.contract = this.contract.connect(this.signer);
      
      console.log(`wETH signer set for address: ${this.signer.address}`);
      return true;
    } catch (error) {
      console.error('Failed to set wETH signer:', error);
      throw error;
    }
  }

  // Read-only operations
  async getTokenName() {
    try {
      return await this.contract.name();
    } catch (error) {
      console.error('Error getting wETH token name:', error);
      throw error;
    }
  }

  async getTokenSymbol() {
    try {
      return await this.contract.symbol();
    } catch (error) {
      console.error('Error getting wETH token symbol:', error);
      throw error;
    }
  }

  async getTokenDecimals() {
    try {
      return await this.contract.decimals();
    } catch (error) {
      console.error('Error getting wETH token decimals:', error);
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
      console.error('Error getting wETH balance:', error);
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
      console.error('Error getting wETH allowance:', error);
      throw error;
    }
  }

  // Get user's ETH balance
  async getETHBalance(address) {
    try {
      const formattedAddress = formatAddress(address);
      const balance = await this.provider.getBalance(formattedAddress);
      return formatAmountFromWei(balance);
    } catch (error) {
      console.error('Error getting ETH balance:', error);
      throw error;
    }
  }

  // Write operations (require signer)
  async depositETH(amount) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for depositing ETH.');
    }

    try {
      const amountWei = formatAmountToWei(amount);
      
      // Deposit ETH to get wETH using the payable deposit function
      const tx = await this.contract.deposit({ value: amountWei });
      const receipt = await tx.wait();
      
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error depositing ETH for wETH:', error);
      throw error;
    }
  }

  async withdrawETH(amount) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for withdrawing ETH.');
    }

    try {
      const amountWei = formatAmountToWei(amount);
      
      // Withdraw wETH to get ETH back
      const tx = await this.contract.withdraw(amountWei);
      const receipt = await tx.wait();
      
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error withdrawing wETH for ETH:', error);
      throw error;
    }
  }

  async approve(spender, amount) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for approval.');
    }

    try {
      const formattedSpender = formatAddress(spender);
      const amountWei = formatAmountToWei(amount);
      const tx = await this.contract.approve(formattedSpender, amountWei);
      const receipt = await tx.wait();
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error approving wETH tokens:', error);
      throw error;
    }
  }

  async transfer(to, amount) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for transfer.');
    }

    try {
      const formattedTo = formatAddress(to);
      const amountWei = formatAmountToWei(amount);
      const tx = await this.contract.transfer(formattedTo, amountWei);
      const receipt = await tx.wait();
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error transferring wETH tokens:', error);
      throw error;
    }
  }

  // Combined operations
  async depositETHAndApprove(ethAmount, spender, approveAmount = null) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for deposit and approve.');
    }

    try {
      // Step 1: Deposit ETH to get wETH
      const depositResult = await this.depositETH(ethAmount);
      
      // Step 2: Approve spender to use wETH (use deposit amount if no specific approve amount)
      const amountToApprove = approveAmount || ethAmount;
      const approveResult = await this.approve(spender, amountToApprove);
      
      return {
        deposit: depositResult,
        approve: approveResult,
        totalETHDeposited: ethAmount,
        totalWETHApproved: amountToApprove,
        spender: formatAddress(spender)
      };
    } catch (error) {
      console.error('Error in deposit and approve operation:', error);
      throw error;
    }
  }
}

export default WETHService; 