import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');

  if (!provider) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Simulate storing the token and connecting the account
  // In a real app, this would involve exchanging a code for a token
  
  // Redirect back to the dashboard with a success flag
  return NextResponse.redirect(new URL(`/?connected=${provider}`, request.url));
}
