import { ethers } from 'ethers';
import {
  validateAddress,
  formatAddress,
  validateAmount,
  validateNonNegativeAmount,
  formatAmountToWei,
  formatAmountFromWei,
  createApiResponse,
  handleApiError,
  validateRequiredFields,
  estimateGas,
  waitForTransaction,
  formatTransactionResult,
  validatePrivateKey,
  sanitizePrivateKey,
} from '../utils.js';

jest.mock('ethers');

describe('Utils Module', () => {
  describe('validateAddress', () => {
    it('should return true for valid address', () => {
      ethers.isAddress.mockReturnValue(true);
      expect(validateAddress('0x1234567890123456789012345678901234567890')).toBe(true);
    });

    it('should return false for invalid address', () => {
      ethers.isAddress.mockReturnValue(false);
      expect(validateAddress('invalid-address')).toBe(false);
    });

    it('should return false when ethers throws error', () => {
      ethers.isAddress.mockImplementation(() => {
        throw new Error('Invalid format');
      });
      expect(validateAddress('0x1234')).toBe(false);
    });
  });

  describe('formatAddress', () => {
    it('should return formatted address for valid input', () => {
      const address = '0x1234567890123456789012345678901234567890';
      ethers.getAddress.mockReturnValue(address);
      expect(formatAddress(address)).toBe(address);
    });

    it('should throw error for invalid address', () => {
      ethers.getAddress.mockImplementation(() => {
        throw new Error('Invalid address');
      });
      expect(() => formatAddress('invalid')).toThrow('Invalid address format');
    });
  });

  describe('validateAmount', () => {
    it('should return true for positive numbers', () => {
      expect(validateAmount('100')).toBe(true);
      expect(validateAmount(50)).toBe(true);
      expect(validateAmount('0.001')).toBe(true);
    });

    it('should return false for zero or negative numbers', () => {
      expect(validateAmount('0')).toBe(false);
      expect(validateAmount('-100')).toBe(false);
      expect(validateAmount('-0.001')).toBe(false);
    });

    it('should return false for invalid numbers', () => {
      expect(validateAmount('abc')).toBe(false);
      expect(validateAmount('')).toBe(false);
      expect(validateAmount(null)).toBe(false);
    });
  });

  describe('validateNonNegativeAmount', () => {
    it('should return true for positive numbers and zero', () => {
      expect(validateNonNegativeAmount('100')).toBe(true);
      expect(validateNonNegativeAmount(50)).toBe(true);
      expect(validateNonNegativeAmount('0')).toBe(true);
      expect(validateNonNegativeAmount('0.001')).toBe(true);
    });

    it('should return false for negative numbers', () => {
      expect(validateNonNegativeAmount('-100')).toBe(false);
      expect(validateNonNegativeAmount('-0.001')).toBe(false);
    });

    it('should return false for invalid numbers', () => {
      expect(validateNonNegativeAmount('abc')).toBe(false);
      expect(validateNonNegativeAmount('')).toBe(false);
      expect(validateNonNegativeAmount(null)).toBe(false);
    });
  });

  describe('formatAmountToWei', () => {
    it('should convert amount to wei', () => {
      const mockBigInt = BigInt('1000000000000000000'); // 1 ether in wei
      ethers.parseUnits.mockReturnValue(mockBigInt);
      
      const result = formatAmountToWei('1');
      expect(ethers.parseUnits).toHaveBeenCalledWith('1', 18);
      expect(result).toBe(mockBigInt);
    });

    it('should handle string and number inputs', () => {
      formatAmountToWei(100);
      expect(ethers.parseUnits).toHaveBeenCalledWith('100', 18);
    });
  });

  describe('formatAmountFromWei', () => {
    it('should convert wei to token units', () => {
      ethers.formatUnits.mockReturnValue('1.0');
      
      const result = formatAmountFromWei('1000000000000000000');
      expect(ethers.formatUnits).toHaveBeenCalledWith('1000000000000000000', 18);
      expect(result).toBe('1.0');
    });
  });

  describe('createApiResponse', () => {
    it('should create successful response with data', () => {
      const data = { message: 'success' };
      const response = createApiResponse(true, data);
      
      expect(response).toEqual({
        success: true,
        data: data
      });
    });

    it('should create successful response without data', () => {
      const response = createApiResponse(true);
      
      expect(response).toEqual({
        success: true
      });
    });

    it('should create error response with error message', () => {
      const response = createApiResponse(false, null, 'Error occurred');
      
      expect(response).toEqual({
        success: false,
        error: 'Error occurred'
      });
    });

    it('should create error response with details', () => {
      const response = createApiResponse(false, null, 'Error occurred', 'Detailed error info');
      
      expect(response).toEqual({
        success: false,
        error: 'Error occurred',
        details: 'Detailed error info'
      });
    });
  });

  describe('handleApiError', () => {
    it('should handle error with default operation', () => {
      const error = new Error('Test error');
      const response = handleApiError(error);
      
      expect(response).toEqual({
        success: false,
        error: 'Failed to operation',
        details: 'Test error'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in operation:', error);
    });

    it('should handle error with custom operation', () => {
      const error = new Error('Custom error');
      const response = handleApiError(error, 'custom operation');
      
      expect(response).toEqual({
        success: false,
        error: 'Failed to custom operation',
        details: 'Custom error'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in custom operation:', error);
    });
  });

  describe('validateRequiredFields', () => {
    it('should return null for valid request body', () => {
      const body = { field1: 'value1', field2: 'value2' };
      const requiredFields = ['field1', 'field2'];
      
      const result = validateRequiredFields(body, requiredFields);
      expect(result).toBeNull();
    });

    it('should return error response for missing field', () => {
      const body = { field1: 'value1' };
      const requiredFields = ['field1', 'field2'];
      
      const result = validateRequiredFields(body, requiredFields);
      expect(result).toEqual({
        success: false,
        error: 'field2 is required'
      });
    });

    it('should return error for empty field', () => {
      const body = { field1: 'value1', field2: '' };
      const requiredFields = ['field1', 'field2'];
      
      const result = validateRequiredFields(body, requiredFields);
      expect(result).toEqual({
        success: false,
        error: 'field2 is required'
      });
    });
  });

  describe('estimateGas', () => {
    it('should estimate gas for contract method', async () => {
      const mockContract = {
        testMethod: {
          estimateGas: jest.fn().mockResolvedValue(BigInt('21000'))
        }
      };
      
      const result = await estimateGas(mockContract, 'testMethod', ['param1']);
      
      expect(mockContract.testMethod.estimateGas).toHaveBeenCalledWith('param1');
      expect(result).toBe('21000');
    });

    it('should handle gas estimation error', async () => {
      const mockContract = {
        testMethod: {
          estimateGas: jest.fn().mockRejectedValue(new Error('Gas estimation failed'))
        }
      };
      
      await expect(estimateGas(mockContract, 'testMethod')).rejects.toThrow('Gas estimation failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Gas estimation failed:', expect.any(Error));
    });
  });

  describe('waitForTransaction', () => {
    it('should wait for transaction with default confirmations', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ hash: '0x123', status: 1 })
      };
      
      const result = await waitForTransaction(mockTx);
      
      expect(mockTx.wait).toHaveBeenCalledWith(1);
      expect(result).toEqual({ hash: '0x123', status: 1 });
    });

    it('should wait for transaction with custom confirmations', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ hash: '0x123', status: 1 })
      };
      
      await waitForTransaction(mockTx, 3);
      expect(mockTx.wait).toHaveBeenCalledWith(3);
    });

    it('should handle transaction failure', async () => {
      const mockTx = {
        wait: jest.fn().mockRejectedValue(new Error('Transaction failed'))
      };
      
      await expect(waitForTransaction(mockTx)).rejects.toThrow('Transaction failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Transaction failed:', expect.any(Error));
    });
  });

  describe('formatTransactionResult', () => {
    it('should format transaction receipt', () => {
      const receipt = {
        hash: '0x1234567890abcdef',
        blockNumber: 12345,
        gasUsed: { toString: () => '21000' },
        status: 1,
        confirmations: 2
      };
      
      const result = formatTransactionResult(receipt);
      
      expect(result).toEqual({
        transactionHash: '0x1234567890abcdef',
        blockNumber: 12345,
        gasUsed: '21000',
        status: 1,
        confirmations: 2
      });
    });
  });

  describe('validatePrivateKey', () => {
    it('should return true for valid private key', () => {
      const validKey = '0x' + 'a'.repeat(64);
      ethers.Wallet.mockImplementation(() => ({}));
      
      const result = validatePrivateKey(validKey);
      expect(result).toBe(true);
    });

    it('should return false for invalid hex format', () => {
      const invalidKey = '0x' + 'g'.repeat(64); // 'g' is not a valid hex character
      
      const result = validatePrivateKey(invalidKey);
      expect(result).toBe(false);
    });

    it('should return false for wrong length', () => {
      const shortKey = '0x' + 'a'.repeat(32);
      
      const result = validatePrivateKey(shortKey);
      expect(result).toBe(false);
    });

    it('should return false when Wallet constructor throws', () => {
      const validKey = '0x' + 'a'.repeat(64);
      ethers.Wallet.mockImplementation(() => {
        throw new Error('Invalid private key');
      });
      
      const result = validatePrivateKey(validKey);
      expect(result).toBe(false);
    });
  });

  describe('sanitizePrivateKey', () => {
    it('should sanitize long private key', () => {
      const privateKey = '0x1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop';
      const result = sanitizePrivateKey(privateKey);
      expect(result).toBe('0x1234...mnop');
    });

    it('should return *** for short strings', () => {
      expect(sanitizePrivateKey('short')).toBe('***');
      expect(sanitizePrivateKey('')).toBe('***');
      expect(sanitizePrivateKey(null)).toBe('***');
    });
  });
}); 