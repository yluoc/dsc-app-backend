import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAmount, createApiResponse, handleApiError, validateRequiredFields } from '../../../../lib/utils.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { wethAmount, privateKey } = body;

    // Validate required parameters
    const validationError = validateRequiredFields(body, ['wethAmount', 'privateKey']);
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 });
    }

    // Validate amount
    if (!validateAmount(wethAmount)) {
      return NextResponse.json(
        createApiResponse(false, null, 'wETH amount must be a positive number'),
        { status: 400 }
      );
    }

    // Set signer with private key
    dscService.setSigner(privateKey);

    // Get user's wETH balance to verify they have enough
    const wethBalance = await dscService.weth.getBalance(dscService.signer.address);
    if (parseFloat(wethBalance) < parseFloat(wethAmount)) {
      return NextResponse.json(
        createApiResponse(false, null, `Insufficient wETH balance. Available: ${wethBalance} wETH, Required: ${wethAmount} wETH`),
        { status: 400 }
      );
    }

    // Unwrap wETH to ETH
    const result = await dscService.weth.withdrawETH(wethAmount);

    // Get updated balances
    const newETHBalance = await dscService.weth.getETHBalance(dscService.signer.address);
    const newWETHBalance = await dscService.weth.getBalance(dscService.signer.address);

    return NextResponse.json({
      success: true,
      data: {
        wethAmountUnwrapped: wethAmount,
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
    console.error('Error unwrapping wETH to ETH:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to unwrap wETH to ETH',
        details: error.message
      },
      { status: 500 }
    );
  }
} 