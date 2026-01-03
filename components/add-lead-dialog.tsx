"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface AddLeadDialogProps {
  onLeadAdded: () => void
}

export function AddLeadDialog({ onLeadAdded }: AddLeadDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingCategories, setIsFetchingCategories] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  const [formData, setFormData] = useState({
    gym_name: "",
    email: "",
    phone: "",
    website: "",
    city: "",
    state: "",
    notes: "",
    category_id: "",
  })

  useEffect(() => {
    if (open) {
      fetchCategories()
    }
  }, [open])

  const fetchCategories = async () => {
    setIsFetchingCategories(true)
    try {
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setIsFetchingCategories(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category_id: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gym_name: formData.gym_name,
          email: formData.email || null,
          phone: formData.phone || null,
          website: formData.website || null,
          city: formData.city || null,
          state: formData.state || null,
          notes: formData.notes || null,
          category_id: formData.category_id || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add lead")
      }

      setFormData({
        gym_name: "",
        email: "",
        phone: "",
        website: "",
        city: "",
        state: "",
        notes: "",
        category_id: "",
      })
      setOpen(false)
      onLeadAdded()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>Enter gym details to add a new lead</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="gym_name">Gym Name *</Label>
            <Input
              id="gym_name"
              name="gym_name"
              placeholder="e.g., Fitness Plus"
              value={formData.gym_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contact@gym.com"
              value={formData.email}
              onChange={handleChange}
            
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category_id} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {isFetchingCategories ? (
                  <p className="p-2 text-sm">Loading categories...</p>
                ) : categories.length === 0 ? (
                  <p className="p-2 text-sm">No categories yet</p>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="123-456-7890"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                placeholder="www.gym.com"
                value={formData.website}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="New York" value={formData.city} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                placeholder="NY"
                maxLength={2}
                value={formData.state}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
