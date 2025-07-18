import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAmount, createApiResponse, handleApiError, validateRequiredFields } from '../../../../lib/utils.js';

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

    // Get user's ETH balance to verify they have enough
    const ethBalance = await dscService.weth.getETHBalance(dscService.signer.address);
    if (parseFloat(ethBalance) < parseFloat(ethAmount)) {
      return NextResponse.json(
        createApiResponse(false, null, `Insufficient ETH balance. Available: ${ethBalance} ETH, Required: ${ethAmount} ETH`),
        { status: 400 }
      );
    }

    // Wrap ETH to wETH
    const result = await dscService.weth.depositETH(ethAmount);

    // Get updated balances
    const newETHBalance = await dscService.weth.getETHBalance(dscService.signer.address);
    const newWETHBalance = await dscService.weth.getBalance(dscService.signer.address);

    return NextResponse.json({
      success: true,
      data: {
        ethAmountWrapped: ethAmount,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        status: result.status,
        userAddress: dscService.signer.address,
        balances: {
          newETHBalance,
          newWETHBalance
        }
      }
    });
  } catch (error) {
    console.error('Error wrapping ETH to wETH:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to wrap ETH to wETH',
        details: error.message
      },
      { status: 500 }
    );
  }
} 