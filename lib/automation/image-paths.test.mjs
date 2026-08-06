// Self-check for the zip/storage key derivation.
// Run: node --test lib/automation/image-paths.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { outputKeys } from './image-paths.ts'

const f = (relativePath, name = relativePath.split('/').pop()) => ({ name, relativePath })

test('preserves the SKU subfolder, drops the picked root', () => {
  assert.deepEqual(
    outputKeys([f('bulk/SKU-1001/front.jpg'), f('bulk/SKU-1001/side.jpg'), f('bulk/SKU-1002/main.png')]),
    ['SKU-1001/front', 'SKU-1001/side', 'SKU-1002/main'],
  )
})

test('keeps deeper nesting and lifts loose files to the zip root', () => {
  assert.deepEqual(
    outputKeys([f('bulk/SKU-1/detail/macro.jpg'), f('bulk/loose.jpg')]),
    ['SKU-1/detail/macro', 'loose'],
  )
})

test('flat multi-select has no relativePath and stays flat', () => {
  assert.deepEqual(
    outputKeys([{ name: 'front.jpg', relativePath: '' }, { name: 'side.jpeg', relativePath: '' }]),
    ['front', 'side'],
  )
})

test('collisions get suffixed instead of silently overwriting', () => {
  assert.deepEqual(
    outputKeys([
      { name: 'a.jpg', relativePath: '' },
      { name: 'a.png', relativePath: '' },
      { name: 'a.webp', relativePath: '' },
    ]),
    ['a', 'a-2', 'a-3'],
  )
})

test('a folder tree does not collide across SKUs sharing a filename', () => {
  assert.deepEqual(
    outputKeys([f('bulk/SKU-1/front.jpg'), f('bulk/SKU-2/front.jpg')]),
    ['SKU-1/front', 'SKU-2/front'],
  )
})

test('sanitizes spaces and unsafe characters per segment', () => {
  assert.deepEqual(
    outputKeys([f('bulk/Big & Bold/red shirt (front).jpg'), f('bulk/SKU 7/café.jpg')]),
    ['Big-Bold/red-shirt-front', 'SKU-7/caf'],
  )
})

test('a name that sanitizes away still gets a usable key', () => {
  assert.deepEqual(outputKeys([{ name: '@@@.jpg', relativePath: '' }]), ['image'])
})
