import { desc } from 'drizzle-orm'
import { db } from '../../utils/db'
import { recipes } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const session = await getUserSession(event)
  if (!session?.user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }

  const rows = await db.query.recipes.findMany({
    orderBy: [desc(recipes.updatedAt)],
    with: {
      recipeTags: {
        with: { tag: true }
      }
    }
  })

  const exported = rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    ingredients: r.ingredients,
    instructions: r.instructions,
    imageUrl: r.imageUrl,
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    tags: r.recipeTags.map((rt) => rt.tag.name)
  }))

  const exportObject = {
    version: 1,
    exportedAt: new Date().toISOString(),
    recipes: exported
  }

  setResponseHeader(event, 'Content-Type', 'application/json')
  setResponseHeader(event, 'Content-Disposition', 'attachment; filename="recipes-export.json"')

  return exportObject
})
