import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAddress, formatAddress, createApiResponse, handleApiError } from '../../../../lib/utils.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        createApiResponse(false, null, 'Address parameter is required'),
        { status: 400 }
      );
    }

    if (!validateAddress(address)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Invalid Ethereum address format'),
        { status: 400 }
      );
    }

    const formattedAddress = formatAddress(address);
    const balance = await dscService.getBalance(formattedAddress);

    return NextResponse.json(
      createApiResponse(true, {
        address: formattedAddress,
        balance,
        symbol: await dscService.getTokenSymbol()
      })
    );
  } catch (error) {
    return NextResponse.json(
      handleApiError(error, 'fetch balance'),
      { status: 500 }
    );
  }
} 