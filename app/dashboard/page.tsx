"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddLeadDialog } from "@/components/add-lead-dialog"
import { LeadsTable } from "@/components/leads-table"
import { SyncGmailButton } from "@/components/sync-gmail-button"
import { GmailSetupButton } from "@/components/gmail-setup-button"
import { CategoryManagerDialog } from "@/components/category-manager-dialog"
import { LoadingAnimation } from "@/components/loading-animation"
import { LogOut, Mail, CheckCircle, AlertCircle, Users } from "lucide-react"

interface Lead {
  id: string
  gym_name: string
  email: string
  phone: string | null
  website: string | null
  city: string | null
  state: string | null
  email_status: string
  follow_up_count: number
  category_id: string | null
  categories?: {
    id: string
    name: string
    color: string
  }
}

interface Stats {
  total: number
  sent: number
  replied: number
  bounced: number
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, sent: 0, replied: 0, bounced: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")
  const [gmailConnected, setGmailConnected] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const fetchLeads = async () => {
    try {
      const response = await fetch("/api/leads")
      if (!response.ok) throw new Error("Failed to fetch leads")
      const data = await response.json()
      setLeads(data)

      const newStats = {
        total: data.length,
        sent: data.filter((l: Lead) => l.email_status === "sent").length,
        replied: data.filter((l: Lead) => l.email_status === "replied").length,
        bounced: data.filter((l: Lead) => l.email_status === "bounced").length,
      }
      setStats(newStats)
    } catch (error) {
      console.error("Error fetching leads:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || "")
      }
    }
    getUser()
    fetchLeads()
    checkGmailConnection()
  }, [])

  const checkGmailConnection = async () => {
    try {
      const response = await fetch("/api/email/sync", {
        method: "GET",
      })
      setGmailConnected(response.ok)
    } catch {
      setGmailConnected(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/email/sync", {
        method: "POST",
      })
      if (response.ok) {
        await fetchLeads()
      }
    } catch (error) {
      console.error("Sync error:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <LoadingAnimation isLoading={isSyncing} message="Syncing replies..." />

      <header className="border-b bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Gym Lead Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">{userEmail}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <CategoryManagerDialog onCategoriesUpdated={fetchLeads} />
              {gmailConnected ? <SyncGmailButton onSync={handleSync} /> : <GmailSetupButton />}
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Emails Sent</CardTitle>
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.sent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Replies</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.replied}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Bounced</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.bounced}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
            <div>
              <CardTitle>Leads</CardTitle>
              <CardDescription>Manage and track all your leads</CardDescription>
            </div>
            <AddLeadDialog onLeadAdded={fetchLeads} />
          </CardHeader>
          <CardContent>
            <LeadsTable leads={leads} isLoading={isLoading} onLeadDeleted={fetchLeads} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
