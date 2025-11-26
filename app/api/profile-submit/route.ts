import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    const body = await request.json();
    
    console.log('Profile submission request:', JSON.stringify(body, null, 2));

    const response = await fetch(`https://pulscore.org/api/add_Profile_data`, {
      method: 'POST',
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Profile submission response:', response.status, data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error submitting profile:', error);
    return NextResponse.json({ error: 'Failed to submit profile' }, { status: 500 });
  }
}