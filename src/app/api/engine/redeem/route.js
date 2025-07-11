import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAddress, formatAddress, validateAmount, createApiResponse, handleApiError, validateRequiredFields } from '../../../../lib/utils.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { tokenCollateralAddress, amountCollateral, privateKey } = body;

    // Validate required parameters
    const validationError = validateRequiredFields(body, ['tokenCollateralAddress', 'amountCollateral', 'privateKey']);
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 });
    }

    // Validate address format
    if (!validateAddress(tokenCollateralAddress)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Invalid collateral token address format'),
        { status: 400 }
      );
    }

    // Validate amount
    if (!validateAmount(amountCollateral)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Amount must be a positive number'),
        { status: 400 }
      );
    }

    // Set signer with private key
    dscService.setSigner(privateKey);

    // Format address
    const formattedToken = formatAddress(tokenCollateralAddress);

    // Redeem collateral
    const result = await dscService.dscEngine.redeemCollateral(formattedToken, amountCollateral);

    return NextResponse.json({
      success: true,
      data: {
        tokenCollateralAddress: formattedToken,
        amountCollateral,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        status: result.status
      }
    });
  } catch (error) {
    console.error('Error redeeming collateral:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to redeem collateral',
        details: error.message
      },
      { status: 500 }
    );
  }
} 