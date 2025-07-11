import { ethers } from 'ethers';

/**
 * Validate Ethereum address format
 * @param {string} address - Ethereum address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateAddress(address) {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
}

/**
 * Format Ethereum address to checksum format
 * @param {string} address - Ethereum address to format
 * @returns {string} - Checksummed address
 */
export function formatAddress(address) {
  try {
    return ethers.getAddress(address);
  } catch (error) {
    throw new Error('Invalid address format');
  }
}

/**
 * Validate amount is a positive number
 * @param {string|number} amount - Amount to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateAmount(amount) {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

/**
 * Validate amount is a non-negative number
 * @param {string|number} amount - Amount to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateNonNegativeAmount(amount) {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0;
}

/**
 * Format amount to wei (assuming 18 decimals)
 * @param {string|number} amount - Amount in token units
 * @returns {bigint} - Amount in wei
 */
export function formatAmountToWei(amount) {
  return ethers.parseUnits(amount.toString(), 18);
}

/**
 * Format amount from wei to token units
 * @param {bigint|string} amount - Amount in wei
 * @returns {string} - Amount in token units
 */
export function formatAmountFromWei(amount) {
  return ethers.formatUnits(amount, 18);
}

/**
 * Create standardized API response
 * @param {boolean} success - Whether the operation was successful
 * @param {any} data - Response data
 * @param {string} error - Error message (if any)
 * @param {string} details - Error details (if any)
 * @returns {object} - Standardized response object
 */
export function createApiResponse(success, data = null, error = null, details = null) {
  const response = { success };
  
  if (success && data) {
    response.data = data;
  }
  
  if (!success) {
    if (error) response.error = error;
    if (details) response.details = details;
  }
  
  return response;
}

/**
 * Handle API errors consistently
 * @param {Error} error - Error object
 * @param {string} operation - Operation that failed
 * @returns {object} - Error response object
 */
export function handleApiError(error, operation = 'operation') {
  console.error(`Error in ${operation}:`, error);
  
  return createApiResponse(
    false,
    null,
    `Failed to ${operation}`,
    error.message
  );
}

/**
 * Validate required fields in request body
 * @param {object} body - Request body
 * @param {string[]} requiredFields - Array of required field names
 * @returns {object|null} - Error response if validation fails, null if valid
 */
export function validateRequiredFields(body, requiredFields) {
  for (const field of requiredFields) {
    if (!body[field]) {
      return createApiResponse(
        false,
        null,
        `${field} is required`
      );
    }
  }
  return null;
}

/**
 * Get gas estimate for a transaction
 * @param {object} contract - Contract instance
 * @param {string} method - Method name
 * @param {array} params - Method parameters
 * @returns {string} - Gas estimate as string
 */
export async function estimateGas(contract, method, params = []) {
  try {
    const gasEstimate = await contract[method].estimateGas(...params);
    return gasEstimate.toString();
  } catch (error) {
    console.error('Gas estimation failed:', error);
    throw error;
  }
}

/**
 * Wait for transaction confirmation
 * @param {object} tx - Transaction object
 * @param {number} confirmations - Number of confirmations to wait for
 * @returns {object} - Transaction receipt
 */
export async function waitForTransaction(tx, confirmations = 1) {
  try {
    return await tx.wait(confirmations);
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

/**
 * Format transaction result
 * @param {object} receipt - Transaction receipt
 * @returns {object} - Formatted transaction result
 */
export function formatTransactionResult(receipt) {
  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    status: receipt.status,
    confirmations: receipt.confirmations
  };
}

/**
 * Check if string is a valid private key
 * @param {string} privateKey - Private key to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validatePrivateKey(privateKey) {
  try {
    // Check if it's a valid hex string with 0x prefix
    if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
      return false;
    }
    
    // Try to create a wallet to validate
    new ethers.Wallet(privateKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Sanitize private key for logging (show only first and last 4 characters)
 * @param {string} privateKey - Private key to sanitize
 * @returns {string} - Sanitized private key
 */
export function sanitizePrivateKey(privateKey) {
  if (!privateKey || privateKey.length < 8) {
    return '***';
  }
  return `${privateKey.slice(0, 6)}...${privateKey.slice(-4)}`;
} 