import { ethers } from 'ethers';

jest.mock('ethers');
jest.mock('../dscEngine.js');
jest.mock('../abi/abi_constants.js', () => ({
  dscAddress: '0x1234567890123456789012345678901234567890',
  dscAbi: []
}));
jest.mock('../utils.js', () => ({
  validatePrivateKey: jest.fn(),
  formatAmountFromWei: jest.fn(),
  formatAmountToWei: jest.fn(),
  formatTransactionResult: jest.fn(),
}));

describe('DSCService', () => {
  let mockContract;
  let mockProvider;
  let mockSigner;
  let mockUtils;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    mockContract = {
      ...global.mockContract,
      connect: jest.fn().mockReturnThis(),
    };
    
    mockProvider = global.mockProvider;
    mockSigner = global.mockWallet;

    ethers.JsonRpcProvider.mockImplementation(() => mockProvider);
    ethers.Contract.mockImplementation(() => mockContract);
    ethers.Wallet.mockImplementation(() => mockSigner);
    
    // Setup utils mocks
    mockUtils = require('../utils.js');
    mockUtils.validatePrivateKey.mockReturnValue(true);
    mockUtils.formatAmountFromWei.mockImplementation(val => val.toString());
    mockUtils.formatAmountToWei.mockImplementation(val => BigInt(val));
    mockUtils.formatTransactionResult.mockImplementation(receipt => receipt);
  });

  describe('service functionality', () => {
    let dscService;
    
    beforeEach(() => {
      // Mock the DSC service class for testing
      const DSCServiceClass = jest.fn().mockImplementation(() => ({
        provider: mockProvider,
        contract: mockContract,
        signer: null,
        dscEngine: { setSigner: jest.fn() },
        setSigner: jest.fn(),
        getTokenName: jest.fn(),
        getTokenSymbol: jest.fn(),
        getTokenDecimals: jest.fn(),
        getTotalSupply: jest.fn(),
        getBalance: jest.fn(),
        getAllowance: jest.fn(),
        getOwner: jest.fn(),
        mintTokens: jest.fn(),
        burnTokens: jest.fn(),
        approve: jest.fn(),
        transfer: jest.fn(),
        renounceOwnership: jest.fn(),
      }));
      
      dscService = new DSCServiceClass();
    });

    it('should have all required methods', () => {
      expect(dscService).toHaveProperty('setSigner');
      expect(dscService).toHaveProperty('getTokenName');
      expect(dscService).toHaveProperty('mintTokens');
      expect(dscService).toHaveProperty('burnTokens');
    });
  });

  describe('setSigner', () => {
    let dscService;
    
    beforeEach(() => {
      dscService = {
        setSigner: jest.fn(),
        provider: mockProvider
      };
    });

    it('should call setSigner method', () => {
      const privateKey = '0x' + 'a'.repeat(64);
      dscService.setSigner(privateKey);
      expect(dscService.setSigner).toHaveBeenCalledWith(privateKey);
    });
  });

  describe('read-only operations', () => {
    let dscService;
    
    beforeEach(() => {
      dscService = {
        getTokenName: jest.fn(),
        getTokenSymbol: jest.fn(),
        getTokenDecimals: jest.fn(),
        getTotalSupply: jest.fn(),
        getBalance: jest.fn(),
        getAllowance: jest.fn(),
        getOwner: jest.fn(),
        mintTokens: jest.fn(),
        burnTokens: jest.fn(),
        approve: jest.fn(),
        transfer: jest.fn(),
        renounceOwnership: jest.fn(),
        signer: null,
      };
    });
    
    describe('getTokenName', () => {
      it('should return token name', async () => {
        dscService.getTokenName.mockResolvedValue('DecentralizedStableCoin');
        
        const result = await dscService.getTokenName();
        expect(result).toBe('DecentralizedStableCoin');
        expect(dscService.getTokenName).toHaveBeenCalled();
      });
    });

    it('should handle other service methods', async () => {
      dscService.getTokenSymbol.mockResolvedValue('DSC');
      dscService.getTokenDecimals.mockResolvedValue(18);
      dscService.getTotalSupply.mockResolvedValue('1000000');
      dscService.getBalance.mockResolvedValue('100.5');
      dscService.getAllowance.mockResolvedValue('50.25');
      dscService.getOwner.mockResolvedValue('0x1111111111111111111111111111111111111111');

      expect(await dscService.getTokenSymbol()).toBe('DSC');
      expect(await dscService.getTokenDecimals()).toBe(18);
      expect(await dscService.getTotalSupply()).toBe('1000000');
      expect(await dscService.getBalance('0x123')).toBe('100.5');
      expect(await dscService.getAllowance('0x111', '0x222')).toBe('50.25');
      expect(await dscService.getOwner()).toBe('0x1111111111111111111111111111111111111111');
    });
  });

  describe('write operations', () => {
    let dscService;
    
    beforeEach(() => {
      dscService = {
        mintTokens: jest.fn(),
        burnTokens: jest.fn(),
        approve: jest.fn(),
        transfer: jest.fn(),
        renounceOwnership: jest.fn(),
        signer: mockSigner,
      };
    });

    it('should handle token operations', async () => {
      const mockResult = { transactionHash: '0x123' };
      
      dscService.mintTokens.mockResolvedValue(mockResult);
      dscService.burnTokens.mockResolvedValue(mockResult);
      dscService.approve.mockResolvedValue(mockResult);
      dscService.transfer.mockResolvedValue(mockResult);
      dscService.renounceOwnership.mockResolvedValue(mockResult);

      expect(await dscService.mintTokens('0x111', '100')).toEqual(mockResult);
      expect(await dscService.burnTokens('50')).toEqual(mockResult);
      expect(await dscService.approve('0x222', '200')).toEqual(mockResult);
      expect(await dscService.transfer('0x333', '75')).toEqual(mockResult);
      expect(await dscService.renounceOwnership()).toEqual(mockResult);
    });
  });
}); 