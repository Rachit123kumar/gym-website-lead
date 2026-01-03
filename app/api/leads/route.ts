import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""
  const status = searchParams.get("status") || ""
  const category = searchParams.get("category") || ""
  const sortBy = searchParams.get("sortBy") || "created_at"
  const sortOrder = searchParams.get("sortOrder") || "desc"

  let query = supabase.from("leads").select("*, categories(id, name, color)").eq("user_id", user.id)

  if (search) {
    query = query.or(
      `gym_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,city.ilike.%${search}%`,
    )
  }

  if (status && status !== "all") {
    query = query.eq("email_status", status)
  }

  if (category && category !== "all") {
    query = query.eq("category_id", category)
  }

  const ascending = sortOrder === "asc"
  query = query.order(sortBy, { ascending })

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const { gym_name, email, phone, website, city, state, notes, category_id } = body

  // Validate required fields
  if (!gym_name ) {
    return NextResponse.json({ error: "Gym name and email are required" }, { status: 400 })
  }

  const { data, error } = await supabase.from("leads").insert({
    user_id: user.id,
    gym_name,
    email,
    phone: phone || null,
    website: website || null,
    city: city || null,
    state: state || null,
    notes: notes || null,
    category_id: category_id || null,
  })

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error: `Lead with this ${error.message.includes("email") ? "email" : error.message.includes("phone") ? "phone" : "website"} already exists`,
        },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
