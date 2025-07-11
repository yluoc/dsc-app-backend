import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAddress, formatAddress, createApiResponse, handleApiError } from '../../../../lib/utils.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, amount, privateKey } = body;

    // Validate required parameters
    if (!to || !amount || !privateKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'to, amount, and privateKey are required'
        },
        { status: 400 }
      );
    }

    // Validate address format
    if (!validateAddress(to)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid recipient address format'
        },
        { status: 400 }
      );
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Amount must be a positive number'
        },
        { status: 400 }
      );
    }

    // Set signer with private key
    dscService.setSigner(privateKey);

    // Format address
    const formattedAddress = formatAddress(to);

    // Transfer tokens
    const result = await dscService.transfer(formattedAddress, amountNum);

    return NextResponse.json({
      success: true,
      data: {
        recipient: formattedAddress,
        amount: amountNum,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        status: result.status
      }
    });
  } catch (error) {
    console.error('Error transferring tokens:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to transfer tokens',
        details: error.message
      },
      { status: 500 }
    );
  }
} 