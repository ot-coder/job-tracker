import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

const db = getAdminDb()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const updateData = {
      status: 'waiting',
      followUpDate: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      notes: 'Follow-up sent'
    }

    await db.collection('applications').doc(id).update(updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking follow-up:', error)
    return NextResponse.json({ error: 'Failed to mark follow-up' }, { status: 500 })
  }
}
