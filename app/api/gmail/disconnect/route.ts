import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export async function POST() {
  try {
    const cookieStore = cookies()

    // Clear Gmail tokens
    cookieStore.delete('gmail_access_token')
    cookieStore.delete('gmail_refresh_token')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Gmail:', error)
    return NextResponse.json({ error: 'Failed to disconnect Gmail' }, { status: 500 })
  }
}
