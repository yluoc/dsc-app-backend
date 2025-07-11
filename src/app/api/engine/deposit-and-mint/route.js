import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAddress, formatAddress, validateAmount, createApiResponse, handleApiError, validateRequiredFields } from '../../../../lib/utils.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { tokenCollateralAddress, amountCollateral, amountDscToMint, privateKey } = body;

    // Validate required parameters
    const validationError = validateRequiredFields(body, ['tokenCollateralAddress', 'amountCollateral', 'amountDscToMint', 'privateKey']);
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

    // Validate amounts
    if (!validateAmount(amountCollateral)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Collateral amount must be a positive number'),
        { status: 400 }
      );
    }

    if (!validateAmount(amountDscToMint)) {
      return NextResponse.json(
        createApiResponse(false, null, 'DSC amount must be a positive number'),
        { status: 400 }
      );
    }

    // Set signer with private key
    dscService.setSigner(privateKey);

    // Format address
    const formattedToken = formatAddress(tokenCollateralAddress);

    // Deposit collateral and mint DSC
    const result = await dscService.dscEngine.depositCollateralAndMintDSC(formattedToken, amountCollateral, amountDscToMint);

    return NextResponse.json({
      success: true,
      data: {
        tokenCollateralAddress: formattedToken,
        amountCollateral,
        amountDscToMint,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        status: result.status
      }
    });
  } catch (error) {
    console.error('Error depositing collateral and minting DSC:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to deposit collateral and mint DSC',
        details: error.message
      },
      { status: 500 }
    );
  }
} 