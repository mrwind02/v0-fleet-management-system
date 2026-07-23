import { redirect } from "next/navigation"

export default function RootPage() {
  // Redirect to dashboard page bypass login
  redirect("/dashboard")
}
