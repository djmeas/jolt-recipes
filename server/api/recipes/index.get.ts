import { like, or, eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { recipes, tags, recipeTags } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = typeof query.q === 'string' ? query.q.trim() : ''
  const tagFilter = typeof query.tag === 'string' ? query.tag.trim() : ''

  let matchingRecipeIds: number[] | null = null

  if (tagFilter) {
    const tagRow = await db.query.tags.findFirst({
      where: eq(tags.name, tagFilter)
    })
    if (!tagRow) {
      return []
    }
    const rows = await db
      .select({ recipeId: recipeTags.recipeId })
      .from(recipeTags)
      .where(eq(recipeTags.tagId, tagRow.id))
    matchingRecipeIds = rows.map((r) => r.recipeId)
    if (matchingRecipeIds.length === 0) {
      return []
    }
  }

  if (!search && matchingRecipeIds === null) {
    const recipeRows = await db.query.recipes.findMany({
      orderBy: (recipes, { desc }) => [desc(recipes.updatedAt)],
      with: {
        recipeTags: {
          with: {
            tag: true
          }
        }
      }
    })
    return recipeRows.map((r) => ({
      id: r.id,
      title: r.title,
      imageUrl: r.imageUrl,
      prepTime: r.prepTime,
      cookTime: r.cookTime,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      tags: r.recipeTags.map((rt) => rt.tag.name)
    }))
  }

  if (search && matchingRecipeIds === null) {
    const pattern = `%${search}%`
    const recipeRows = await db.query.recipes.findMany({
      where: or(
        like(recipes.title, pattern),
        like(recipes.ingredients, pattern),
        like(recipes.instructions, pattern)
      ),
      orderBy: (recipes, { desc }) => [desc(recipes.updatedAt)],
      with: {
        recipeTags: {
          with: {
            tag: true
          }
        }
      }
    })
    return recipeRows.map((r) => ({
      id: r.id,
      title: r.title,
      imageUrl: r.imageUrl,
      prepTime: r.prepTime,
      cookTime: r.cookTime,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      tags: r.recipeTags.map((rt) => rt.tag.name)
    }))
  }

  if (!search && matchingRecipeIds !== null) {
    const recipeRows = await db.query.recipes.findMany({
      where: matchingRecipeIds.length > 1
        ? or(...matchingRecipeIds.map((id) => eq(recipes.id, id)))
        : eq(recipes.id, matchingRecipeIds[0]!),
      orderBy: (recipes, { desc }) => [desc(recipes.updatedAt)],
      with: {
        recipeTags: {
          with: {
            tag: true
          }
        }
      }
    })
    return recipeRows.map((r) => ({
      id: r.id,
      title: r.title,
      imageUrl: r.imageUrl,
      prepTime: r.prepTime,
      cookTime: r.cookTime,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      tags: r.recipeTags.map((rt) => rt.tag.name)
    }))
  }

  const pattern = `%${search}%`
  const matchedSearch = await db.query.recipes.findMany({
    where: or(
      like(recipes.title, pattern),
      like(recipes.ingredients, pattern),
      like(recipes.instructions, pattern)
    ),
    with: {
      recipeTags: {
        with: {
          tag: true
        }
      }
    }
  })
  const filtered = matchedSearch.filter((r) => matchingRecipeIds!.includes(r.id))
  filtered.sort((a, b) => {
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
    return bTime - aTime
  })
  return filtered.map((r) => ({
    id: r.id,
    title: r.title,
    imageUrl: r.imageUrl,
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    tags: r.recipeTags.map((rt) => rt.tag.name)
  }))
})