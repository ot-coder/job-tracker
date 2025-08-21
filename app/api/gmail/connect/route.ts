import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export async function POST() {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly'
    ]

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    })

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error generating auth URL:', error)
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 })
  }
}
