//Redirects any OAuth callbacks to my existing gmail api callback

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const sourceUrl = new URL(request.url)
    const targetUrl = new URL('/api/gmail/callback', sourceUrl.origin)
    targetUrl.search = sourceUrl.search
    return NextResponse.redirect(targetUrl)
}


