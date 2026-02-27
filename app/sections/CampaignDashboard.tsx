'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FiPlus, FiTrendingUp, FiMail, FiSend } from 'react-icons/fi'
import { BsTwitterX } from 'react-icons/bs'
import { SiSlack } from 'react-icons/si'

export interface CampaignRecord {
  id: string
  name: string
  status: 'Draft' | 'Live' | 'Completed'
  date: string
  channels: string[]
}

interface CampaignDashboardProps {
  campaigns: CampaignRecord[]
  postsSent: number
  emailsDelivered: number
  onNewCampaign: () => void
  showSampleData: boolean
}

const SAMPLE_CAMPAIGNS: CampaignRecord[] = [
  { id: '1', name: 'Q1 Product Launch', status: 'Live', date: '2026-02-25', channels: ['twitter', 'email', 'slack'] },
  { id: '2', name: 'Spring Webinar Series', status: 'Draft', date: '2026-02-20', channels: ['email', 'slack'] },
  { id: '3', name: 'Brand Awareness Push', status: 'Completed', date: '2026-02-10', channels: ['twitter', 'email'] },
  { id: '4', name: 'Customer Success Stories', status: 'Live', date: '2026-02-18', channels: ['twitter', 'slack'] },
  { id: '5', name: 'End of Year Recap', status: 'Completed', date: '2026-01-30', channels: ['email'] },
]

function getStatusColor(status: string) {
  switch (status) {
    case 'Live': return 'bg-green-100 text-green-700 border-green-200'
    case 'Draft': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

function ChannelIcon({ channel }: { channel: string }) {
  switch (channel) {
    case 'twitter': return <BsTwitterX className="h-3.5 w-3.5 text-muted-foreground" />
    case 'email': return <FiMail className="h-3.5 w-3.5 text-muted-foreground" />
    case 'slack': return <SiSlack className="h-3.5 w-3.5 text-muted-foreground" />
    default: return null
  }
}

export default function CampaignDashboard({ campaigns, postsSent, emailsDelivered, onNewCampaign, showSampleData }: CampaignDashboardProps) {
  const displayCampaigns = showSampleData ? SAMPLE_CAMPAIGNS : campaigns
  const activeCampaigns = displayCampaigns.filter(c => c.status === 'Live').length
  const displayPosts = showSampleData ? 24 : postsSent
  const displayEmails = showSampleData ? 156 : emailsDelivered

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Campaign Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Overview of your marketing campaigns</p>
        </div>
        <Button onClick={onNewCampaign} className="gap-2 rounded-[0.875rem]">
          <FiPlus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-[0.875rem] bg-primary/10">
                <FiTrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold text-foreground">{activeCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-[0.875rem] bg-blue-50">
                <FiSend className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posts Sent</p>
                <p className="text-2xl font-bold text-foreground">{displayPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-[0.875rem] bg-green-50">
                <FiMail className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Emails Delivered</p>
                <p className="text-2xl font-bold text-foreground">{displayEmails}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
        <CardHeader>
          <CardTitle className="text-lg">Campaign History</CardTitle>
        </CardHeader>
        <CardContent>
          {displayCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <FiTrendingUp className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No campaigns yet. Create your first campaign to get started.</p>
              <Button onClick={onNewCampaign} variant="outline" className="mt-4 gap-2 rounded-[0.875rem]">
                <FiPlus className="h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[380px]">
              <div className="space-y-3 pr-4">
                {displayCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 rounded-[0.875rem] bg-background/60 border border-border/60 hover:border-primary/30 transition-all duration-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <h3 className="font-medium text-sm text-foreground truncate">{campaign.name}</h3>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{campaign.date}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {Array.isArray(campaign.channels) && campaign.channels.map((ch) => (
                        <ChannelIcon key={ch} channel={ch} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
