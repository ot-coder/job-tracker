'use client'

import { TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Application {
  id: string
  company: string
  position: string
  applicationDate: string
  status: 'applied' | 'rejected' | 'interview' | 'waiting' | 'ghosted' | 'offer'
  lastUpdate: string
  notes?: string
  emailId?: string
  followUpDate?: string
}

interface StatsOverviewProps {
  applications: Application[]
}

export function StatsOverview({ applications }: StatsOverviewProps) {
  const totalApplications = applications.length
  const activeApplications = applications.filter(app => 
    ['applied', 'waiting', 'interview'].includes(app.status)
  ).length
  const offers = applications.filter(app => app.status === 'offer').length
  const rejections = applications.filter(app => app.status === 'rejected').length
  
  const responseRate = totalApplications > 0 
    ? Math.round(((totalApplications - applications.filter(app => app.status === 'ghosted').length) / totalApplications) * 100)
    : 0

  const stats = [
    {
      title: 'Total Applications',
      value: totalApplications,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Applications',
      value: activeApplications,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Offers Received',
      value: offers,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Response Rate',
      value: `${responseRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
