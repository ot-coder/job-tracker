import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { cookies } from 'next/headers'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
    }

    const { tokens } = await oauth2Client.getAccessToken(code)
    
    // Store tokens securely (in production, use encrypted storage)
    const cookieStore = cookies()
    cookieStore.set('gmail_access_token', tokens.access_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600 // 1 hour
    })
    
    if (tokens.refresh_token) {
      cookieStore.set('gmail_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      })
    }

    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    console.error('Error handling Gmail callback:', error)
    return NextResponse.json({ error: 'Failed to authenticate with Gmail' }, { status: 500 })
  }
}
