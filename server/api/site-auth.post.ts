import { z } from 'zod'
import { setCookie } from 'h3'

const bodySchema = z.object({
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const sitePassword = process.env.SITE_PASSWORD || ''

  if (!sitePassword) {
    setCookie(event, 'site-auth', '1', {
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/'
    })
    return { success: true }
  }

  const body = await readBody(event)
  const parseResult = bodySchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({ statusCode: 400, message: 'Password is required' })
  }

  if (parseResult.data.password !== sitePassword) {
    throw createError({ statusCode: 401, message: 'Incorrect password' })
  }

  setCookie(event, 'site-auth', '1', {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/'
  })

  return { success: true }
})