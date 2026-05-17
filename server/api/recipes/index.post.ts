import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { recipes, tags, recipeTags } from '../../db/schema'

const bodySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  ingredients: z.string().min(1, 'Ingredients are required'),
  instructions: z.string().min(1, 'Instructions are required'),
  imageUrl: z.string().url('Invalid URL').or(z.literal('')).optional(),
  prepTime: z.number().int().min(0).optional(),
  cookTime: z.number().int().min(0).optional(),
  tagNames: z.array(z.string().min(1)).optional()
})

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const session = await getUserSession(event)
  if (!session?.user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }

  const body = await readBody(event)
  const parseResult = bodySchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.issues.map((e: { message: string }) => e.message).join(', ')
    })
  }

  const { title, description, ingredients, instructions, imageUrl, prepTime, cookTime, tagNames } = parseResult.data

  const [recipe] = await db
    .insert(recipes)
    .values({
      title,
      description: description ?? null,
      ingredients,
      instructions,
      imageUrl: imageUrl || null,
      prepTime: prepTime ?? null,
      cookTime: cookTime ?? null
    })
    .returning({ id: recipes.id })

  if (!recipe) {
    throw createError({ statusCode: 500, message: 'Failed to create recipe' })
  }

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
          recipeId: recipe.id,
          tagId: existingTag.id
        })
      }
    }
  }

  return { success: true, id: recipe.id }
})