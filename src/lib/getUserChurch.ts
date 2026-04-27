import { supabase } from "@/lib/supabase"

export async function getUserChurchId() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from("users")
    .select("church_id")
    .eq("id", user.id)
    .single()

  return data?.church_id || null
}