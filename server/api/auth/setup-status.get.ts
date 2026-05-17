import { db } from '../../utils/db'
import { users } from '../../db/schema'

export default defineEventHandler(async () => {
  const count = await db.select({ id: users.id }).from(users).limit(1)
  return { setupComplete: count.length > 0 }
})