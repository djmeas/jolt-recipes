import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { recipes, tags, recipeTags } from '../../db/schema'

const bodySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  ingredients: z.string().min(1, 'Ingredients are required'),
  instructions: z.string().min(1, 'Instructions are required'),
  imageUrl: z.string().url('Invalid URL').or(z.literal('')).optional(),
  prepTime: z.number().int().min(0).optional(),
  cookTime: z.number().int().min(0).optional(),
  tagNames: z.array(z.string().min(1)).optional()
})

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

  const body = await readBody(event)
  const parseResult = bodySchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.issues.map((e: { message: string }) => e.message).join(', ')
    })
  }

  const { title, ingredients, instructions, imageUrl, prepTime, cookTime, tagNames } = parseResult.data

  const [updated] = await db
    .update(recipes)
    .set({
      title,
      ingredients,
      instructions,
      imageUrl: imageUrl || null,
      prepTime: prepTime ?? null,
      cookTime: cookTime ?? null,
      updatedAt: new Date()
    })
    .where(eq(recipes.id, id))
    .returning({ id: recipes.id })

  if (!updated) {
    throw createError({ statusCode: 404, message: 'Recipe not found' })
  }

  await db.delete(recipeTags).where(eq(recipeTags.recipeId, id))

  if (tagNames && tagNames.length > 0) {
    for (const name of tagNames) {
      const [tag] = await db
        .insert(tags)
        .values({ name })
        .onConflictDoNothing()
        .returning({ id: tags.id })

      const existingTag = tag || await db.query.tags.findFirst({ where: eq(tags.name, name) })
      if (existingTag) {
        await db.insert(recipeTags).values({
          recipeId: id,
          tagId: existingTag.id
        })
      }
    }
  }

  return { success: true }
})