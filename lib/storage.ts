import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { CLIENT_FILES_BUCKET } from '@/lib/constants'

export const INPUT_BUCKET = 'automation-inputs'
export const OUTPUT_BUCKET = 'automation-outputs'
export const CLIENT_BUCKET = CLIENT_FILES_BUCKET

/** Signed URL the browser can PUT a file to directly (avoids server body limits). */
export async function createUploadUrl(bucket: string, path: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path)
  if (error) throw error
  return data // { signedUrl, token, path }
}

/** Short-lived signed download URL for a stored object. */
export async function createDownloadUrl(bucket: string, path: string, expiresIn = 3600) {
  const admin = createAdminClient()
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}

/** Upload a server-generated buffer (e.g. output xlsx / zip / image). */
export async function uploadBuffer(
  bucket: string,
  path: string,
  body: Buffer | Uint8Array,
  contentType: string,
) {
  const admin = createAdminClient()
  const { error } = await admin.storage.from(bucket).upload(path, body, { contentType, upsert: true })
  if (error) throw error
  return path
}

/** Download a stored object into a Buffer (server-side processing). */
export async function downloadBuffer(bucket: string, path: string): Promise<Buffer> {
  const admin = createAdminClient()
  const { data, error } = await admin.storage.from(bucket).download(path)
  if (error) throw error
  return Buffer.from(await data.arrayBuffer())
}
