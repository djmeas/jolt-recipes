import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { recipes, recipeTags } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const user = await getUserSession(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }

  const id = Number(event.context.params?.id)
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid recipe ID' })
  }

  await db.delete(recipeTags).where(eq(recipeTags.recipeId, id))
  const [deleted] = await db
    .delete(recipes)
    .where(eq(recipes.id, id))
    .returning({ id: recipes.id })

  if (!deleted) {
    throw createError({ statusCode: 404, message: 'Recipe not found' })
  }

  return { success: true }
})