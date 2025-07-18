import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAmount, createApiResponse, handleApiError, validateRequiredFields } from '../../../../lib/utils.js';
import { dscEngineAddress } from '../../../../lib/abi/abi_constants.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { ethAmount, dscToMint, privateKey } = body;

    // Validate required parameters
    const validationError = validateRequiredFields(body, ['ethAmount', 'dscToMint', 'privateKey']);
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 });
    }

    // Validate amounts
    if (!validateAmount(ethAmount)) {
      return NextResponse.json(
        createApiResponse(false, null, 'ETH amount must be a positive number'),
        { status: 400 }
      );
    }

    if (!validateAmount(dscToMint)) {
      return NextResponse.json(
        createApiResponse(false, null, 'DSC amount to mint must be a positive number'),
        { status: 400 }
      );
    }

    // Set signer with private key
    dscService.setSigner(privateKey);

    // Get initial balances
    const initialETHBalance = await dscService.weth.getETHBalance(dscService.signer.address);
    const initialWETHBalance = await dscService.weth.getBalance(dscService.signer.address);
    const initialDSCBalance = await dscService.getBalance(dscService.signer.address);

    // Verify user has enough ETH
    if (parseFloat(initialETHBalance) < parseFloat(ethAmount)) {
      return NextResponse.json(
        createApiResponse(false, null, `Insufficient ETH balance. Available: ${initialETHBalance} ETH, Required: ${ethAmount} ETH`),
        { status: 400 }
      );
    }

    // Step 1: Wrap ETH to wETH
    // console.log(`Step 1: Wrapping ${ethAmount} ETH to wETH...`);
    const wrapResult = await dscService.weth.depositETH(ethAmount);

    // Step 2: Approve DSC Engine to spend wETH
    // console.log(`Step 2: Approving DSC Engine to spend ${ethAmount} wETH...`);
    const approveResult = await dscService.weth.approve(dscEngineAddress, ethAmount);

    // Step 3: Deposit wETH as collateral and mint DSC in one transaction
    //console.log(`Step 3: Depositing ${ethAmount} wETH as collateral and minting ${dscToMint} DSC...`);
    const depositAndMintResult = await dscService.dscEngine.depositCollateralAndMintDSC(
      dscService.weth.contract.target, // wETH contract address
      ethAmount,
      dscToMint
    );

    // Get final balances and account information
    const [
      finalETHBalance, 
      finalWETHBalance, 
      finalDSCBalance, 
      accountInfo, 
      collateralBalance,
      healthFactor
    ] = await Promise.all([
      dscService.weth.getETHBalance(dscService.signer.address),
      dscService.weth.getBalance(dscService.signer.address),
      dscService.getBalance(dscService.signer.address),
      dscService.dscEngine.getAccountInformation(dscService.signer.address),
      dscService.dscEngine.getCollateralBalanceOfUser(dscService.signer.address, dscService.weth.contract.target),
      dscService.dscEngine.getHealthFactor(dscService.signer.address)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        workflow: 'ETH → wETH → Collateral Deposit → DSC Mint',
        ethAmountProcessed: ethAmount,
        dscMinted: dscToMint,
        userAddress: dscService.signer.address,
        steps: {
          step1_wrap: {
            description: 'Wrapped ETH to wETH',
            transactionHash: wrapResult.transactionHash,
            gasUsed: wrapResult.gasUsed
          },
          step2_approve: {
            description: 'Approved DSC Engine to spend wETH',
            transactionHash: approveResult.transactionHash,
            gasUsed: approveResult.gasUsed
          },
          step3_depositAndMint: {
            description: 'Deposited wETH as collateral and minted DSC',
            transactionHash: depositAndMintResult.transactionHash,
            gasUsed: depositAndMintResult.gasUsed
          }
        },
        balances: {
          before: {
            eth: initialETHBalance,
            weth: initialWETHBalance,
            dsc: initialDSCBalance
          },
          after: {
            eth: finalETHBalance,
            weth: finalWETHBalance,
            dsc: finalDSCBalance
          },
          changes: {
            ethUsed: (parseFloat(initialETHBalance) - parseFloat(finalETHBalance)).toFixed(6),
            wethCollateral: collateralBalance,
            dscReceived: (parseFloat(finalDSCBalance) - parseFloat(initialDSCBalance)).toFixed(6)
          }
        },
        dscAccount: {
          totalDscMinted: accountInfo.totalDscMinted,
          collateralValueInUsd: accountInfo.collateralValueInUsd,
          healthFactor: healthFactor,
          wethCollateralDeposited: collateralBalance
        },
        contracts: {
          wethAddress: dscService.weth.contract.target,
          dscEngineAddress: dscEngineAddress,
          dscTokenAddress: dscService.contract.target
        }
      }
    });
  } catch (error) {
    console.error('Error in ETH to wETH collateral deposit and mint workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete ETH to wETH collateral deposit and mint workflow',
        details: error.message,
        step: error.step || 'unknown'
      },
      { status: 500 }
    );
  }
} 