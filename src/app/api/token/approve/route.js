import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAddress, formatAddress, createApiResponse, handleApiError } from '../../../../lib/utils.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { spender, amount, privateKey } = body;

    // Validate required parameters
    if (!spender || !amount || !privateKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'spender, amount, and privateKey are required'
        },
        { status: 400 }
      );
    }

    // Validate address format
    if (!validateAddress(spender)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid spender address format'
        },
        { status: 400 }
      );
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Amount must be a non-negative number'
        },
        { status: 400 }
      );
    }

    // Set signer with private key
    dscService.setSigner(privateKey);

    // Format address
    const formattedAddress = formatAddress(spender);

    // Approve tokens
    const result = await dscService.approve(formattedAddress, amountNum);

    return NextResponse.json({
      success: true,
      data: {
        spender: formattedAddress,
        amount: amountNum,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        status: result.status
      }
    });
  } catch (error) {
    console.error('Error approving tokens:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to approve tokens',
        details: error.message
      },
      { status: 500 }
    );
  }
} 