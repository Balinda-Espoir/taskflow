import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
let mongod;
const app = createApp();
const H = { 'X-Requested-With': 'XMLHttpRequest' };

const newAgent = () => {
  const agent = request.agent(app);
  return {
    post: (u, b) => agent.post(u).set(H).send(b),
    get: (u) => agent.get(u).set(H),
    patch: (u, b) => agent.patch(u).set(H).send(b),
    delete: (u) => agent.delete(u).set(H),
  };
};
const creds = { name: 'Alice', email: 'alice@example.com', password: 'Passw0rdX' };

beforeAll(async () => { mongod = await MongoMemoryServer.create(); await connectDB(mongod.getUri()); });
afterAll(async () => { await disconnectDB(); await mongod.stop(); });
beforeEach(async () => { await mongoose.connection.dropDatabase(); });

describe('health', () => {
  it('reports ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('auth', () => {
  it('registers, sets httpOnly cookies and never returns the password', async () => {
    const res = await request(app).post('/api/v1/auth/register').set(H).send(creds);
    expect(res.status).toBe(201);
    expect(res.body.data.user.password).toBeUndefined();
    const cookies = res.headers['set-cookie'].join(';');
    expect(cookies).toMatch(/accessToken=.*HttpOnly/);
    expect(cookies).toMatch(/refreshToken=.*HttpOnly/);
  });

  it('ignores a client-supplied role', async () => {
    const res = await request(app).post('/api/v1/auth/register').set(H).send({ ...creds, role: 'admin' });
    expect(res.body.data.user.role).toBe('user');
  });

  it('rejects weak passwords and duplicate emails', async () => {
    expect((await request(app).post('/api/v1/auth/register').set(H).send({ ...creds, password: 'short' })).status).toBe(400);
    await request(app).post('/api/v1/auth/register').set(H).send(creds);
    expect((await request(app).post('/api/v1/auth/register').set(H).send(creds)).status).toBe(409);
  });

  it('rejects state-changing requests without the CSRF header', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(creds);
    expect(res.status).toBe(403);
  });

  it('logs in, rejects bad credentials, and protects /me', async () => {
    await request(app).post('/api/v1/auth/register').set(H).send(creds);
    const a = newAgent();
    expect((await a.post('/api/v1/auth/login', { email: creds.email, password: 'wrong-pass1' })).status).toBe(401);
    expect((await a.get('/api/v1/auth/me')).status).toBe(401);
    expect((await a.post('/api/v1/auth/login', { email: creds.email, password: creds.password })).status).toBe(200);
    const me = await a.get('/api/v1/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe(creds.email);
  });

  it('rotates refresh tokens and revokes the session on reuse', async () => {
    const reg = await request(app).post('/api/v1/auth/register').set(H).send(creds);
    const oldCookies = reg.headers['set-cookie'];
    const first = await request(app).post('/api/v1/auth/refresh').set(H).set('Cookie', oldCookies);
    expect(first.status).toBe(200);
    const reuse = await request(app).post('/api/v1/auth/refresh').set(H).set('Cookie', oldCookies);
    expect(reuse.status).toBe(401);
  });

  it('logout clears the session', async () => {
    const a = newAgent();
    await a.post('/api/v1/auth/register', creds);
    await a.post('/api/v1/auth/logout', {});
    expect((await a.get('/api/v1/auth/me')).status).toBe(401);
  });
});

describe('tasks', () => {
  it('supports CRUD, filtering and pagination', async () => {
    const a = newAgent();
    await a.post('/api/v1/auth/register', creds);
    for (let i = 1; i <= 12; i++) await a.post('/api/v1/tasks', { title: `Task ${i}`, status: i % 2 ? 'todo' : 'done' });

    const page1 = await a.get('/api/v1/tasks?limit=5&page=1');
    expect(page1.body.data).toHaveLength(5);
    expect(page1.body.meta.total).toBe(12);
    expect(page1.body.meta.pages).toBe(3);

    const done = await a.get('/api/v1/tasks?status=done&limit=50');
    expect(done.body.data.every((t) => t.status === 'done')).toBe(true);

    const search = await a.get('/api/v1/tasks?search=task%2011');
    expect(search.body.data).toHaveLength(1);

    const id = page1.body.data[0]._id;
    const upd = await a.patch(`/api/v1/tasks/${id}`, { status: 'in_progress' });
    expect(upd.body.data.status).toBe('in_progress');
    expect((await a.delete(`/api/v1/tasks/${id}`)).status).toBe(200);
    expect((await a.get(`/api/v1/tasks/${id}`)).status).toBe(404);

    const stats = await a.get('/api/v1/tasks/stats');
    expect(stats.body.data.total).toBe(11);
  });

  it('validates input and isolates tasks between users', async () => {
    const a = newAgent();
    const b = newAgent();
    await a.post('/api/v1/auth/register', creds);
    await b.post('/api/v1/auth/register', { ...creds, email: 'bob@example.com', name: 'Bob' });

    expect((await a.post('/api/v1/tasks', { title: '' })).status).toBe(400);
    const t = await a.post('/api/v1/tasks', { title: 'Private' });
    const id = t.body.data._id;

    expect((await b.get(`/api/v1/tasks/${id}`)).status).toBe(404);
    expect((await b.patch(`/api/v1/tasks/${id}`, { title: 'hacked' })).status).toBe(404);
    expect((await b.delete(`/api/v1/tasks/${id}`)).status).toBe(404);
    expect((await b.get('/api/v1/tasks')).body.data).toHaveLength(0);
  });
});

describe('RBAC', () => {
  it('blocks normal users from admin routes and lets admins manage users', async () => {
    const u = newAgent();
    await u.post('/api/v1/auth/register', creds);
    expect((await u.get('/api/v1/users')).status).toBe(403);

    await User.create({ name: 'Admin', email: 'admin@example.com', password: 'AdminPass1', role: 'admin' });
    const admin = newAgent();
    await admin.post('/api/v1/auth/login', { email: 'admin@example.com', password: 'AdminPass1' });
    const list = await admin.get('/api/v1/users');
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBe(2);

    const target = list.body.data.find((x) => x.email === creds.email);
    const off = await admin.patch(`/api/v1/users/${target._id}`, { isActive: false });
    expect(off.body.data.isActive).toBe(false);
    expect((await u.get('/api/v1/auth/me')).status).toBe(401);
  });
});
