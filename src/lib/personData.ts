import type { PersonNodeData } from '../types/graph'

/** Matches the default when creating a node (`graphStore.defaultPersonData`). */
export const DEFAULT_NEW_PERSON_NAME = 'New person'

/** Placeholder when saving an empty name in the editor. */
export const EMPTY_NAME_PLACEHOLDER = 'Unnamed'

/**
 * true if the card can be deleted without confirmation (template only, no filled fields).
 */
export function isPersonDataVisuallyEmpty(data: PersonNodeData): boolean {
  const name = data.name.trim()
  if (
    name !== '' &&
    name !== DEFAULT_NEW_PERSON_NAME &&
    name !== EMPTY_NAME_PLACEHOLDER
  ) {
    return false
  }
  if (data.birthDate) return false
  if (data.comment?.trim()) return false
  if (data.photo) return false
  for (const [k, v] of Object.entries(data.customFields)) {
    if (k.trim() && v.trim()) return false
  }
  return true
}
