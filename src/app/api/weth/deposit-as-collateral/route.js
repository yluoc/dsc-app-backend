import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAmount, createApiResponse, handleApiError, validateRequiredFields } from '../../../../lib/utils.js';
import { dscEngineAddress } from '../../../../lib/abi/abi_constants.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { ethAmount, privateKey } = body;

    // Validate required parameters
    const validationError = validateRequiredFields(body, ['ethAmount', 'privateKey']);
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 });
    }

    // Validate amount
    if (!validateAmount(ethAmount)) {
      return NextResponse.json(
        createApiResponse(false, null, 'ETH amount must be a positive number'),
        { status: 400 }
      );
    }

    // Set signer with private key
    dscService.setSigner(privateKey);

    // Get initial balances
    const initialETHBalance = await dscService.weth.getETHBalance(dscService.signer.address);
    const initialWETHBalance = await dscService.weth.getBalance(dscService.signer.address);

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

    // Step 3: Deposit wETH as collateral in DSC Engine
    // console.log(`Step 3: Depositing ${ethAmount} wETH as collateral...`);
    const depositResult = await dscService.dscEngine.depositCollateral(
      dscService.weth.contract.target, // wETH contract address
      ethAmount
    );

    // Get final balances and account information
    const [finalETHBalance, finalWETHBalance, accountInfo, collateralBalance] = await Promise.all([
      dscService.weth.getETHBalance(dscService.signer.address),
      dscService.weth.getBalance(dscService.signer.address),
      dscService.dscEngine.getAccountInformation(dscService.signer.address),
      dscService.dscEngine.getCollateralBalanceOfUser(dscService.signer.address, dscService.weth.contract.target)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        workflow: 'ETH → wETH → Collateral Deposit',
        ethAmountProcessed: ethAmount,
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
          step3_deposit: {
            description: 'Deposited wETH as collateral',
            transactionHash: depositResult.transactionHash,
            gasUsed: depositResult.gasUsed
          }
        },
        balances: {
          before: {
            eth: initialETHBalance,
            weth: initialWETHBalance
          },
          after: {
            eth: finalETHBalance,
            weth: finalWETHBalance
          }
        },
        dscAccount: {
          totalDscMinted: accountInfo.totalDscMinted,
          collateralValueInUsd: accountInfo.collateralValueInUsd,
          wethCollateralDeposited: collateralBalance
        },
        contracts: {
          wethAddress: dscService.weth.contract.target,
          dscEngineAddress: dscEngineAddress
        }
      }
    });
  } catch (error) {
    console.error('Error in ETH to wETH collateral deposit workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete ETH to wETH collateral deposit workflow',
        details: error.message,
        step: error.step || 'unknown'
      },
      { status: 500 }
    );
  }
} 