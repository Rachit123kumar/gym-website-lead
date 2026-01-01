import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold">Gym Lead Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              Manage gym leads and send personalized AI-powered email pitches
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="lg" variant="outline">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
