import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { users } from '../../db/schema'

const bodySchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export default defineEventHandler(async (event) => {
  const anyUser = await db.query.users.findFirst()
  if (anyUser) {
    throw createError({
      statusCode: 403,
      message: 'Setup has already been completed. An admin user exists.'
    })
  }

  const body = await readBody(event)
  const parseResult = bodySchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.issues.map((e) => e.message).join(', ')
    })
  }

  const { email, password } = parseResult.data

  const passwordHash = await hashPassword(password)

  await db.insert(users).values({
    email,
    passwordHash,
    isAdmin: true
  })

  return { success: true }
})