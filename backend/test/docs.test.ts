import { test, expect } from 'vitest';
import { buildApp } from '../src/app';

test('create and share a document flow', async () => {
  const app = buildApp();
  await app.ready();

  // Ensure server is ready and seeded
  const user1 = await app.inject({ method: 'GET', url: '/api/users' });
  const users = user1.json();
  const alice = users.find((u: any) => u.username === 'Alice');
  const bob = users.find((u: any) => u.username === 'Bob');

  expect(alice).toBeDefined();
  expect(bob).toBeDefined();

  // Create doc
  const docRes = await app.inject({
    method: 'POST',
    url: '/api/documents',
    headers: { 'x-user-id': alice.id },
    payload: { title: 'Test Doc', content: '<p>Hello</p>' }
  });
  
  expect(docRes.statusCode).toBe(200);
  const doc = docRes.json();
  expect(doc.title).toBe('Test Doc');

  // Share doc
  const shareRes = await app.inject({
    method: 'POST',
    url: `/api/documents/${doc.id}/share`,
    headers: { 'x-user-id': alice.id },
    payload: { username: 'Bob' }
  });
  
  expect(shareRes.statusCode).toBe(200);

  // Bob should be able to get the doc
  const getDoc = await app.inject({
    method: 'GET',
    url: `/api/documents/${doc.id}`,
    headers: { 'x-user-id': bob.id }
  });

  expect(getDoc.statusCode).toBe(200);
  expect(getDoc.json().id).toBe(doc.id);
});
