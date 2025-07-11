import { ethers } from 'ethers';
import { dscEngineAddress, dscEngineAbi } from './abi/abi_constants.js';
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

class DSCEngineService {
  constructor(provider) {
    this.provider = provider;
    this.contract = null;
    this.signer = null;
    this.initializeContract();
  }

  initializeContract() {
    try {
      this.contract = new ethers.Contract(dscEngineAddress, dscEngineAbi, this.provider);
      console.log('DSC Engine service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DSC Engine service:', error);
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
      
      console.log(`DSC Engine signer set for address: ${this.signer.address}`);
      return true;
    } catch (error) {
      console.error('Failed to set DSC Engine signer:', error);
      throw error;
    }
  }

  // Read-only operations
  async getAccountInformation(user) {
    try {
      const formattedUser = formatAddress(user);
      const [totalDscMinted, collateralValueInUsd] = await this.contract.getAccountInformation(formattedUser);
      return {
        totalDscMinted: formatAmountFromWei(totalDscMinted),
        collateralValueInUsd: formatAmountFromWei(collateralValueInUsd)
      };
    } catch (error) {
      console.error('Error getting account information:', error);
      throw error;
    }
  }

  async getHealthFactor(user) {
    try {
      const formattedUser = formatAddress(user);
      const healthFactor = await this.contract.getHealthFactor(formattedUser);
      return formatAmountFromWei(healthFactor);
    } catch (error) {
      console.error('Error getting health factor:', error);
      throw error;
    }
  }

  async getAccountCollateralValued(user) {
    try {
      const formattedUser = formatAddress(user);
      const totalCollateralValueInUsd = await this.contract.getAccountCollateralValued(formattedUser);
      return formatAmountFromWei(totalCollateralValueInUsd);
    } catch (error) {
      console.error('Error getting account collateral value:', error);
      throw error;
    }
  }

  async getCollateralBalanceOfUser(user, token) {
    try {
      const formattedUser = formatAddress(user);
      const formattedToken = formatAddress(token);
      const balance = await this.contract.getCollateralBalanceOfUser(formattedUser, formattedToken);
      return formatAmountFromWei(balance);
    } catch (error) {
      console.error('Error getting collateral balance:', error);
      throw error;
    }
  }

  async getCollateralTokens() {
    try {
      const tokens = await this.contract.getCollateralTokens();
      return tokens;
    } catch (error) {
      console.error('Error getting collateral tokens:', error);
      throw error;
    }
  }

  async getCollateralTokenPriceFeed(token) {
    try {
      const formattedToken = formatAddress(token);
      const priceFeed = await this.contract.getCollateralTokenPriceFeed(formattedToken);
      return priceFeed;
    } catch (error) {
      console.error('Error getting collateral token price feed:', error);
      throw error;
    }
  }

  async getTokenAmountFromUsd(token, usdAmountInWei) {
    try {
      const formattedToken = formatAddress(token);
      const amount = await this.contract.getTokenAmountFromUsd(formattedToken, usdAmountInWei);
      return formatAmountFromWei(amount);
    } catch (error) {
      console.error('Error getting token amount from USD:', error);
      throw error;
    }
  }

  async getUsdValue(token, amount) {
    try {
      const formattedToken = formatAddress(token);
      const amountWei = formatAmountToWei(amount);
      const usdValue = await this.contract.getUsdValue(formattedToken, amountWei);
      return formatAmountFromWei(usdValue);
    } catch (error) {
      console.error('Error getting USD value:', error);
      throw error;
    }
  }

  // Write operations (require signer)
  async depositCollateral(tokenCollateralAddress, amountCollateral) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for depositing collateral.');
    }

    try {
      const formattedToken = formatAddress(tokenCollateralAddress);
      const amountWei = formatAmountToWei(amountCollateral);
      const tx = await this.contract.depositCollateral(formattedToken, amountWei);
      const receipt = await tx.wait();
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error depositing collateral:', error);
      throw error;
    }
  }

  async mintDSC(amountDscToMint) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for minting DSC.');
    }

    try {
      const amountWei = formatAmountToWei(amountDscToMint);
      const tx = await this.contract.mintDSC(amountWei);
      const receipt = await tx.wait();
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error minting DSC:', error);
      throw error;
    }
  }

  async depositCollateralAndMintDSC(tokenCollateralAddress, amountCollateral, amountDscToMint) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for deposit and mint.');
    }

    try {
      const formattedToken = formatAddress(tokenCollateralAddress);
      const collateralWei = formatAmountToWei(amountCollateral);
      const dscWei = formatAmountToWei(amountDscToMint);
      const tx = await this.contract.depositCollateralAndMintDSC(formattedToken, collateralWei, dscWei);
      const receipt = await tx.wait();
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error depositing collateral and minting DSC:', error);
      throw error;
    }
  }

  async redeemCollateral(tokenCollateralAddress, amountCollateral) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for redeeming collateral.');
    }

    try {
      const formattedToken = formatAddress(tokenCollateralAddress);
      const amountWei = formatAmountToWei(amountCollateral);
      const tx = await this.contract.redeemCollateral(formattedToken, amountWei);
      const receipt = await tx.wait();
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error redeeming collateral:', error);
      throw error;
    }
  }

  async burnDSC(amount) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for burning DSC.');
    }

    try {
      const amountWei = formatAmountToWei(amount);
      const tx = await this.contract.burnDSC(amountWei);
      const receipt = await tx.wait();
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error burning DSC:', error);
      throw error;
    }
  }

  async redeemCollateralForDSC(tokenCollateralAddress, amountCollateral, amountDscToBurn) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for redeem and burn.');
    }

    try {
      const formattedToken = formatAddress(tokenCollateralAddress);
      const collateralWei = formatAmountToWei(amountCollateral);
      const dscWei = formatAmountToWei(amountDscToBurn);
      const tx = await this.contract.redeemCollateralForDSC(formattedToken, collateralWei, dscWei);
      const receipt = await tx.wait();
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error redeeming collateral for DSC:', error);
      throw error;
    }
  }

  async liquidate(collateral, user, debtToCover) {
    if (!this.signer) {
      throw new Error('Signer not set. Private key required for liquidation.');
    }

    try {
      const formattedCollateral = formatAddress(collateral);
      const formattedUser = formatAddress(user);
      const debtWei = formatAmountToWei(debtToCover);
      const tx = await this.contract.liquidate(formattedCollateral, formattedUser, debtWei);
      const receipt = await tx.wait();
      return formatTransactionResult(receipt);
    } catch (error) {
      console.error('Error liquidating position:', error);
      throw error;
    }
  }
}

export default DSCEngineService; 