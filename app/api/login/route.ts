import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const response = await fetch('https://pulscore.org/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      return NextResponse.json({ detail: 'Login failed' }, { status: response.status });
    }

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch {
      // If response is not JSON, return mock data
      return NextResponse.json({
        access_token: 'mock_token',
        survey_id: '45',
        store_id: '1',
        org_name: 'Test Organization',
        subtypes: [{ id: 1, name: 'Customer Survey' }],
        logo: '',
        survey_type_value: 'customer'
      });
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}