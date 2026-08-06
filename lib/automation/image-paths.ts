/**
 * Relative output keys for a batch of uploaded images.
 *
 * Kept separate from image.ts so the client wizard can import it — image.ts
 * pulls in sharp, which can't cross into the browser bundle.
 */

/**
 * Same character rules the storage upload path uses, plus edge-dash trimming so
 * a name made entirely of unsafe characters collapses to '' rather than to '-'.
 */
function sanitizeSegment(s: string) {
  return s
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Derive each file's key: the path it should occupy in the output zip, minus
 * the extension (the pipeline always encodes JPEG).
 *
 *   bulk/SKU-1001/front.jpg        -> SKU-1001/front
 *   bulk/SKU-1001/detail/macro.jpg -> SKU-1001/detail/macro
 *   bulk/loose.jpg                 -> loose
 *   front.jpg (flat multi-select)  -> front
 *
 * The leading folder is the one the user picked, so it's dropped — it becomes
 * the zip itself. Deeper nesting is preserved as-is.
 *
 * Keys must be unique: they're both the storage key and the zip entry, so a
 * clash would silently overwrite. A folder tree can't collide by construction,
 * but a flat multi-select spanning two directories can.
 */
export function outputKeys(files: { name: string; relativePath: string }[]): string[] {
  const taken = new Set<string>()

  return files.map((file) => {
    const parts = (file.relativePath || file.name).split('/').filter(Boolean)
    if (parts.length > 1) parts.shift() // drop the picked root folder
    parts[parts.length - 1] = parts[parts.length - 1].replace(/\.[^.]+$/, '')

    const base = parts.map(sanitizeSegment).filter(Boolean).join('/') || 'image'
    let key = base
    for (let n = 2; taken.has(key); n++) key = `${base}-${n}`
    taken.add(key)
    return key
  })
}
