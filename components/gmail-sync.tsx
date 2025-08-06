'use client'

import { useState } from 'react'
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface GmailSyncProps {
  connected: boolean
  onSync: () => void
  onConnectionChange: (connected: boolean) => void
}

export function GmailSync({ connected, onSync, onConnectionChange }: GmailSyncProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/gmail/connect', { method: 'POST' })
      const data = await response.json()
      
      if (data.authUrl) {
        window.open(data.authUrl, 'gmail-auth', 'width=500,height=600')
        
        // Listen for auth completion
        const checkAuth = setInterval(async () => {
          const statusResponse = await fetch('/api/gmail/status')
          const statusData = await statusResponse.json()
          
          if (statusData.connected) {
            clearInterval(checkAuth)
            onConnectionChange(true)
            setIsConnecting(false)
          }
        }, 2000)
        
        // Stop checking after 5 minutes
        setTimeout(() => {
          clearInterval(checkAuth)
          setIsConnecting(false)
        }, 300000)
      }
    } catch (error) {
      console.error('Error connecting to Gmail:', error)
      setIsConnecting(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/gmail/sync', { method: 'POST' })
      const data = await response.json()
      
      if (response.ok) {
        setLastSync(new Date().toLocaleString())
        onSync()
      }
    } catch (error) {
      console.error('Error syncing Gmail:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await fetch('/api/gmail/disconnect', { method: 'POST' })
      onConnectionChange(false)
      setLastSync(null)
    } catch (error) {
      console.error('Error disconnecting Gmail:', error)
    }
  }

  if (!connected) {
    return (
      <Card className="w-80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4" />
            Gmail Integration
          </CardTitle>
          <CardDescription className="text-xs">
            Connect your Gmail to automatically detect job applications
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            onClick={handleConnect} 
            disabled={isConnecting}
            size="sm"
            className="w-full"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Mail className="w-3 h-3 mr-2" />
                Connect Gmail
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Gmail Connected
      </Badge>
      <Button
        onClick={handleSync}
        disabled={isSyncing}
        size="sm"
        variant="outline"
      >
        {isSyncing ? (
          <>
            <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="w-3 h-3 mr-2" />
            Sync
          </>
        )}
      </Button>
      <Button
        onClick={handleDisconnect}
        size="sm"
        variant="ghost"
        className="text-red-600 hover:text-red-700"
      >
        Disconnect
      </Button>
      {lastSync && (
        <span className="text-xs text-gray-500">
          Last sync: {lastSync}
        </span>
      )}
    </div>
  )
}
