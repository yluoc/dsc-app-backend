import { ethers } from 'ethers';
import { dscAddress, dscAbi } from './abi/abi_constants.js';
import DSCEngineService from './dscEngine.js';
import WETHService from './weth.js';
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

class DSCService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.signer = null;
    this.dscEngine = null;
    this.weth = null;
    this.initializeProvider();
  }

  initializeProvider() {
    try {
      // Use environment variable for RPC URL, fallback to default
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Initialize contract instances
      this.contract = new ethers.Contract(dscAddress, dscAbi, this.provider);
      this.dscEngine = new DSCEngineService(this.provider);
      this.weth = new WETHService(this.provider);
      
      console.log('DSC service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DSC service:', error);
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
      this.dscEngine.setSigner(privateKey);
      this.weth.setSigner(privateKey);
      
      console.log(`Signer set for address: ${this.signer.address}`);
      return true;
    } catch (error) {
      console.error('Failed to set signer:', error);
      throw error;
    }
  }

  // Read-only operations
  async getTokenName() {
    try {
      return await this.contract.name();
    } catch (error) {
      console.error('Error getting token name:', error);
      throw error;
    }
  }

  async getTokenSymbol() {
    try {
      return await this.contract.symbol();
    } catch (error) {
      console.error('Error getting token symbol:', error);
      throw error;
    }
  }

  async getTokenDecimals() {
    try {
      return await this.contract.decimals();
    } catch (error) {
      console.error('Error getting token decimals:', error);
      throw error;
    }
  }

  async getTotalSupply() {
    try {
      const supply = await this.contract.totalSupply();
      return formatAmountFromWei(supply);
    } catch (error) {
      console.error('Error getting total supply:', error);
      throw error;
    }
  }

  async getBalance(address) {
    try {
      const balance = await this.contract.balanceOf(address);
      return formatAmountFromWei(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  async getAllowance(owner, spender) {
    try {
      const allowance = await this.contract.allowance(owner, spender);
      return formatAmountFromWei(allowance);
    } catch (error) {
      console.error('Error getting allowance:', error);
      throw error;
    }
  }

  async getOwner() {
    try {
      return await this.contract.owner();
    } catch (error) {
      console.error('Error getting owner:', error);
      throw error;
    }
  }

  // Write operations (require signer)
  async mintTokens(to, amount) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for minting.');
    }

    try {
      const amountWei = formatAmountToWei(amount);
      const tx = await this.contract.mint(to, amountWei);
      const receipt = await tx.wait();
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw error;
    }
  }

  async burnTokens(amount) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for burning.');
    }

    try {
      const amountWei = formatAmountToWei(amount);
      const tx = await this.contract.burn(amountWei);
      const receipt = await tx.wait();
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error burning tokens:', error);
      throw error;
    }
  }

  async approve(spender, amount) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for approval.');
    }

    try {
      const amountWei = formatAmountToWei(amount);
      const tx = await this.contract.approve(spender, amountWei);
      const receipt = await tx.wait();
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error approving tokens:', error);
      throw error;
    }
  }

  async transfer(to, amount) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for burning.');
    }

    try {
      const amountWei = formatAmountToWei(amount);
      const tx = await this.contract.transfer(to, amountWei);
      const receipt = await tx.wait();
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  }

  async renounceOwnership() {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for renouncing ownership.');
    }

    try {
      const tx = await this.contract.renounceOwnership();
      const receipt = await tx.wait();
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error renouncing ownership:', error);
      throw error;
    }
  }


}

// Create singleton instance
const dscService = new DSCService();

export default dscService; 