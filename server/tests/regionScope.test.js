import { test, describe } from 'node:test';
import assert from 'node:assert';
import { enforceRegionScope } from '../src/middleware/regionScope.js';
import { requireRole } from '../src/middleware/role.js';

describe('Role & Regional Scope Authorization Middleware', () => {
  test('requireRole allows request with matching role', () => {
    let nextCalled = false;
    const req = { user: { role: 'SUPERADMIN' } };
    const res = {};
    const next = () => { nextCalled = true; };

    const middleware = requireRole('SUPERADMIN');
    middleware(req, res, next);
    assert.strictEqual(nextCalled, true);
  });

  test('requireRole blocks request with non-matching role', () => {
    let statusCode = null;
    let jsonBody = null;
    const req = { user: { role: 'ADMIN' } };
    const res = {
      status(code) { statusCode = code; return this; },
      json(data) { jsonBody = data; return this; }
    };
    const next = () => {};

    const middleware = requireRole('SUPERADMIN');
    middleware(req, res, next);
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(jsonBody.success, false);
  });

  test('enforceRegionScope strictly enforces assigned regionId for ADMIN and rejects other regions', () => {
    let statusCode = null;
    let jsonBody = null;
    const adminRegionId = '650000000000000000000001';
    const unauthorizedRegionId = '650000000000000000000002';

    const req = {
      user: { role: 'ADMIN', regionId: { _id: adminRegionId } },
      params: { regionId: unauthorizedRegionId }
    };
    const res = {
      status(code) { statusCode = code; return this; },
      json(data) { jsonBody = data; return this; }
    };
    const next = () => {};

    const middleware = enforceRegionScope();
    middleware(req, res, next);
    assert.strictEqual(statusCode, 403);
    assert.ok(jsonBody.message.includes('only authorized to access your assigned region'));
  });

  test('enforceRegionScope sets req.scopedRegionId to assigned region for ADMIN', () => {
    let nextCalled = false;
    const adminRegionId = '650000000000000000000001';
    const req = {
      user: { role: 'ADMIN', regionId: { _id: adminRegionId } },
      params: {}
    };
    const res = {};
    const next = () => { nextCalled = true; };

    const middleware = enforceRegionScope();
    middleware(req, res, next);
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.scopedRegionId, adminRegionId);
  });

  test('enforceRegionScope allows SUPERADMIN to specify any regionId', () => {
    let nextCalled = false;
    const targetRegionId = '650000000000000000000099';
    const req = {
      user: { role: 'SUPERADMIN' },
      query: { regionId: targetRegionId }
    };
    const res = {};
    const next = () => { nextCalled = true; };

    const middleware = enforceRegionScope();
    middleware(req, res, next);
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.scopedRegionId, targetRegionId);
  });
});
