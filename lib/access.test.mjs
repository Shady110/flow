import test from 'node:test'
import assert from 'node:assert/strict'
import { departmentsOf, levelOf, unionPermissions, startPath, canOpenHref } from './access.ts'

test('departments come from roles, fixed order, CEO has none', () => {
  assert.deepEqual(departmentsOf([{ department_key: null }]), [])
  assert.deepEqual(departmentsOf([{ department_key: 'accounts' }, { department_key: 'sales' }, { department_key: 'sales' }]), ['sales', 'accounts'])
})

test('level: director wins over employee, CEO has none', () => {
  assert.equal(levelOf([{ rank: null }]), null)
  assert.equal(levelOf([{ rank: 'employee' }, { rank: 'director' }]), 'head')
  assert.equal(levelOf([{ rank: 'employee' }]), 'member')
})

test('two roles give the union of permissions', () => {
  const p = unionPermissions([['leads.view', 'chat.access'], ['content.workspace', 'chat.access']])
  assert.equal(p.size, 3)
  assert.ok(p.has('leads.view') && p.has('content.workspace'))
})

test('start path: first department home, then CEO overview', () => {
  const homes = { sales: '/leads', content: '/content' }
  const base = { departmentHomes: homes, canOpen: (h) => h === '/content', firstOpenable: () => '/inbox' }
  assert.equal(startPath({ ...base, permissions: new Set(), departments: ['sales', 'content'] }), '/content')
  assert.equal(startPath({ ...base, permissions: new Set(['ops.overview']), departments: [] }), '/')
  assert.equal(startPath({ ...base, permissions: new Set(), departments: [] }), '/inbox')
})

test('links: the CEO is not offered work pages, but can open client and invoice pages', () => {
  const ceo = new Set(['ops.overview', 'clients.view', 'finance.view', 'tickets.view'])
  assert.equal(canOpenHref(ceo, '/accounts/tickets/abc'), false)
  assert.equal(canOpenHref(ceo, '/content/xyz'), false)
  assert.equal(canOpenHref(ceo, '/clients/c1'), true)
  assert.equal(canOpenHref(ceo, '/finance/invoices/i1'), true)
  assert.equal(canOpenHref(new Set(['tickets.manage']), '/accounts/tickets/abc'), true)
})
