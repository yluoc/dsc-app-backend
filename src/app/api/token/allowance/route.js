import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAddress, formatAddress, createApiResponse, handleApiError } from '../../../../lib/utils.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const spender = searchParams.get('spender');

    if (!owner || !spender) {
      return NextResponse.json(
        {
          success: false,
          error: 'Both owner and spender parameters are required'
        },
        { status: 400 }
      );
    }

    if (!validateAddress(owner) || !validateAddress(spender)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Ethereum address format'
        },
        { status: 400 }
      );
    }

    const formattedOwner = formatAddress(owner);
    const formattedSpender = formatAddress(spender);
    const allowance = await dscService.getAllowance(formattedOwner, formattedSpender);

    return NextResponse.json({
      success: true,
      data: {
        owner: formattedOwner,
        spender: formattedSpender,
        allowance,
        symbol: await dscService.getTokenSymbol()
      }
    });
  } catch (error) {
    console.error('Error fetching allowance:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch allowance',
        details: error.message
      },
      { status: 500 }
    );
  }
} 