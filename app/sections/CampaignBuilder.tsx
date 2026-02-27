'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FiZap, FiLoader } from 'react-icons/fi'

interface CampaignBuilderProps {
  onGenerate: (brief: CampaignBrief) => Promise<void>
  isGenerating: boolean
}

export interface CampaignBrief {
  campaignName: string
  targetAudience: string
  keyMessages: string
  tone: string
  channels: string[]
  additionalContext: string
}

const SAMPLE_BRIEF: CampaignBrief = {
  campaignName: 'Spring Product Launch 2026',
  targetAudience: 'Tech-savvy professionals aged 25-45 interested in AI productivity tools',
  keyMessages: 'Revolutionize your workflow with AI-powered automation. Save 10+ hours per week. Trusted by 500+ enterprises worldwide.',
  tone: 'professional',
  channels: ['twitter', 'email', 'slack'],
  additionalContext: 'Launching our new AI assistant feature. Competitors include Notion AI and Microsoft Copilot. Focus on time-saving benefits and enterprise reliability.',
}

export default function CampaignBuilder({ onGenerate, isGenerating }: CampaignBuilderProps) {
  const [brief, setBrief] = useState<CampaignBrief>({
    campaignName: '',
    targetAudience: '',
    keyMessages: '',
    tone: 'professional',
    channels: [],
    additionalContext: '',
  })

  const handleChannelToggle = (channel: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setBrief(prev => ({ ...prev, channels: [...prev.channels, channel] }))
    } else {
      setBrief(prev => ({ ...prev, channels: prev.channels.filter(c => c !== channel) }))
    }
  }

  const handleSubmit = async () => {
    if (!brief.campaignName.trim()) return
    await onGenerate(brief)
  }

  const isFormValid = brief.campaignName.trim().length > 0 && brief.channels.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Campaign Builder</h2>
        <p className="text-sm text-muted-foreground mt-1">Define your campaign brief and let AI craft your content</p>
      </div>

      {isGenerating ? (
        <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FiLoader className="h-8 w-8 text-primary animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-1">Generating Your Campaign</h3>
                <p className="text-sm text-muted-foreground">Researching trends & crafting content...</p>
              </div>
              <div className="w-full max-w-md space-y-3 mt-4">
                <Skeleton className="h-4 w-full rounded-[0.875rem]" />
                <Skeleton className="h-4 w-4/5 rounded-[0.875rem]" />
                <Skeleton className="h-20 w-full rounded-[0.875rem]" />
                <Skeleton className="h-4 w-3/5 rounded-[0.875rem]" />
                <Skeleton className="h-4 w-full rounded-[0.875rem]" />
                <Skeleton className="h-16 w-full rounded-[0.875rem]" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FiZap className="h-5 w-5 text-primary" />
              Campaign Brief
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="campaignName">Campaign Name *</Label>
              <Input
                id="campaignName"
                placeholder="e.g., Spring Product Launch 2026"
                value={brief.campaignName}
                onChange={(e) => setBrief(prev => ({ ...prev, campaignName: e.target.value }))}
                className="rounded-[0.875rem]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Tech professionals aged 25-45"
                value={brief.targetAudience}
                onChange={(e) => setBrief(prev => ({ ...prev, targetAudience: e.target.value }))}
                className="rounded-[0.875rem]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyMessages">Key Messages</Label>
              <Textarea
                id="keyMessages"
                placeholder="Enter the core messages for your campaign..."
                value={brief.keyMessages}
                onChange={(e) => setBrief(prev => ({ ...prev, keyMessages: e.target.value }))}
                rows={3}
                className="rounded-[0.875rem]"
              />
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={brief.tone} onValueChange={(v) => setBrief(prev => ({ ...prev, tone: v }))}>
                <SelectTrigger className="rounded-[0.875rem]">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Channels *</Label>
              <div className="flex flex-wrap gap-4">
                {[
                  { id: 'twitter', label: 'Twitter / X' },
                  { id: 'email', label: 'Email' },
                  { id: 'slack', label: 'Slack' },
                ].map(ch => (
                  <div key={ch.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`channel-${ch.id}`}
                      checked={brief.channels.includes(ch.id)}
                      onCheckedChange={(checked) => handleChannelToggle(ch.id, checked)}
                    />
                    <Label htmlFor={`channel-${ch.id}`} className="text-sm font-normal cursor-pointer">
                      {ch.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalContext">Additional Context</Label>
              <Textarea
                id="additionalContext"
                placeholder="Any extra details, competitor info, or special instructions..."
                value={brief.additionalContext}
                onChange={(e) => setBrief(prev => ({ ...prev, additionalContext: e.target.value }))}
                rows={3}
                className="rounded-[0.875rem]"
              />
            </div>

            <div className="pt-2">
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || isGenerating}
                className="w-full gap-2 rounded-[0.875rem] h-11"
              >
                <FiZap className="h-4 w-4" />
                Generate Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
