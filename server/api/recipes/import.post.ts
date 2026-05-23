import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { recipes, tags, recipeTags } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const session = await getUserSession(event)
  if (!session?.user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }

  const body = await readBody(event)
  const recipeList = Array.isArray(body)
    ? body
    : Array.isArray(body?.recipes)
      ? body.recipes
      : null

  if (!recipeList || !Array.isArray(recipeList)) {
    throw createError({ statusCode: 400, message: 'Expected JSON array of recipes or an object with a recipes array' })
  }

  const errors: { index: number; message: string }[] = []
  let imported = 0

  for (let i = 0; i < recipeList.length; i++) {
    const item = recipeList[i] as any

    if (!item || typeof item !== 'object') {
      errors.push({ index: i, message: 'Not an object' })
      continue
    }

    const title = String(item.title ?? '').trim()
    const ingredients = String(item.ingredients ?? '').trim()
    const instructions = String(item.instructions ?? '').trim()
    const description = String(item.description ?? '').trim() || null
    const imageUrl = String(item.imageUrl ?? '').trim() || null
    const prepTime = item.prepTime != null ? Number(item.prepTime) : null
    const cookTime = item.cookTime != null ? Number(item.cookTime) : null
    const tagNames = Array.isArray(item.tags)
      ? item.tags.filter((t: unknown) => typeof t === 'string' && t.trim())
      : []

    if (!title) {
      errors.push({ index: i, message: 'Title is required' })
      continue
    }
    if (!ingredients) {
      errors.push({ index: i, message: 'Ingredients are required' })
      continue
    }


    const [recipe] = await db
      .insert(recipes)
      .values({
        title,
        description,
        ingredients,
        instructions,
        imageUrl,
        prepTime: prepTime ?? null,
        cookTime: cookTime ?? null
      })
      .returning({ id: recipes.id })

    if (!recipe) {
      errors.push({ index: i, message: 'Failed to insert recipe' })
      continue
    }

    for (const name of tagNames) {
      const [tag] = await db
        .insert(tags)
        .values({ name })
        .onConflictDoNothing()
        .returning({ id: tags.id })

      const existingTag = tag || await db.query.tags.findFirst({ where: eq(tags.name, name) })
      if (existingTag) {
        await db.insert(recipeTags).values({
          recipeId: recipe.id,
          tagId: existingTag.id
        }).onConflictDoNothing()
      }
    }

    imported++
  }

  return {
    success: true,
    imported,
    total: recipeList.length,
    errors
  }
})
