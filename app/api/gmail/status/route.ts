import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('gmail_access_token')

    return NextResponse.json({
      connected: !!accessToken?.value
    })
  } catch (error) {
    console.error('Error checking Gmail status:', error)
    return NextResponse.json({ connected: false })
  }
}
