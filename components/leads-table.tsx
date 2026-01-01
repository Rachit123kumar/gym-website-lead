"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Search, Eye, Trash2, ArrowUpDown } from "lucide-react"
import Link from "next/link"

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
  last_updated: string
}

interface LeadsTableProps {
  leads: Lead[]
  isLoading: boolean
  onLeadDeleted: () => void
  onLeadClick?: (leadId: string) => void
}

export function LeadsTable({ leads, isLoading, onLeadDeleted }: LeadsTableProps) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filteredLeads, setFilteredLeads] = useState(leads)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  useEffect(() => {
    let filtered = [...leads]

    if (search) {
      filtered = filtered.filter(
        (lead) =>
          lead.gym_name.toLowerCase().includes(search.toLowerCase()) ||
          lead.email.toLowerCase().includes(search.toLowerCase()) ||
          lead.city?.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (status !== "all") {
      filtered = filtered.filter((lead) => lead.email_status === status)
    }

    if (category !== "all") {
      filtered = filtered.filter((lead) => lead.category_id === category)
    }

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Lead]
      let bValue: any = b[sortBy as keyof Lead]

      if (sortBy === "last_updated") {
        aValue = new Date(a.last_updated).getTime()
        bValue = new Date(b.last_updated).getTime()
      }

      if (aValue === null || aValue === undefined) aValue = ""
      if (bValue === null || bValue === undefined) bValue = ""

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    setFilteredLeads(filtered)
  }, [search, status, category, sortBy, sortOrder, leads])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this lead?")) return

    try {
      const response = await fetch(`/api/leads/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete lead")
      onLeadDeleted()
    } catch (error) {
      console.error("Error deleting lead:", error)
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "replied":
        return "bg-green-100 text-green-800"
      case "bounced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search gym name, email, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full text-sm"
            />
          </div>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[150px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_sent">Not Sent</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[150px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="hidden sm:table-cell cursor-pointer" onClick={() => handleSort("gym_name")}>
                <div className="flex items-center gap-2">
                  Gym Name
                  {sortBy === "gym_name" && <ArrowUpDown className="h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">City</TableHead>
              <TableHead className="hidden lg:table-cell cursor-pointer" onClick={() => handleSort("categories")}>
                <div className="flex items-center gap-2">
                  Category
                  {sortBy === "categories" && <ArrowUpDown className="h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Follow-ups</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading leads...
                </TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {leads.length === 0 ? "No leads yet. Add your first lead!" : "No leads match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-muted/50">
                  <TableCell className="hidden sm:table-cell font-medium text-sm">{lead.gym_name}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{lead.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-xs sm:text-sm">{lead.city || "-"}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {lead.categories ? (
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: lead.categories.color + "20",
                          color: lead.categories.color,
                          border: `1px solid ${lead.categories.color}`,
                        }}
                      >
                        {lead.categories.name}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getStatusColor(lead.email_status)}`}>
                      {lead.email_status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{lead.follow_up_count}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/leads/${lead.id}`} className="flex items-center gap-2 cursor-pointer">
                            <Eye className="h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(lead.id, e as any)}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
