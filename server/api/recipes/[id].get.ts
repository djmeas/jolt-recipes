import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { recipes } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid recipe ID' })
  }

  const recipe = await db.query.recipes.findFirst({
    where: eq(recipes.id, id),
    with: {
      recipeTags: {
        with: {
          tag: true
        }
      }
    }
  })

  if (!recipe) {
    throw createError({ statusCode: 404, message: 'Recipe not found' })
  }

  return {
    id: recipe.id,
    title: recipe.title,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    imageUrl: recipe.imageUrl,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
    tags: recipe.recipeTags.map((rt) => rt.tag.name)
  }
})