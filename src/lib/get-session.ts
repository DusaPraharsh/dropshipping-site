import { auth } from "@/lib/auth"

export async function getServerSession() {
  const session = await auth()
  return session
}

