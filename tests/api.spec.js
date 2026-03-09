const { test, expect } = require('@playwright/test');

test.describe('User API', () => {
  test('CRUD operations for users', async ({ request }) => {
    // Create
    const createRes = await request.post('http://localhost:3000/users', { data: { name: 'Alice', email: 'alice@example.com' } });
    expect(createRes.status()).toBe(201);
    const user = await createRes.json();
    const id = user.id || user._id;
    expect(id).toBeTruthy();
    expect(user.name).toBe('Alice');

    // Read
    const getRes = await request.get(`http://localhost:3000/users/${id}`);
    expect(getRes.ok()).toBeTruthy();
    const got = await getRes.json();
    expect(got.email).toBe('alice@example.com');

    // Update
    const updateRes = await request.put(`http://localhost:3000/users/${id}`, { data: { name: 'Alice Updated', email: 'alice2@example.com' } });
    expect(updateRes.ok()).toBeTruthy();
    const updated = await updateRes.json();
    expect(updated.name).toBe('Alice Updated');

    // List
    const listRes = await request.get('http://localhost:3000/users');
    expect(listRes.ok()).toBeTruthy();
    const list = await listRes.json();
    expect(Array.isArray(list)).toBeTruthy();
    expect(list.length).toBeGreaterThan(0);

    // Delete
    const delRes = await request.delete(`http://localhost:3000/users/${id}`);
    expect(delRes.status()).toBe(204);

    // Not found after delete
    const notFound = await request.get(`http://localhost:3000/users/${id}`);
    expect(notFound.status()).toBe(404);
  });
});
