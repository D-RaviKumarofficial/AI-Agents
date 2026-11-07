import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { audiences, audienceCounts, filterGroups } from '../src/lib/catalog-filter.mjs';
import { serviceFields } from '../src/lib/services.mjs';

const catalog = JSON.parse(readFileSync(new URL('../src/data/catalog.json', import.meta.url), 'utf8'));

test('directory contains all 22 captured groups and 60 services', () => {
  assert.equal(catalog.groups.length, 22);
  assert.equal(catalog.groups.flatMap(g => g.services).length, 60);
  assert.equal(new Set(catalog.groups.map(g => g.id)).size, 22);
  assert.equal(new Set(catalog.groups.flatMap(g => g.services.map(s => s.id))).size, 60);
  for (const g of catalog.groups) {
    assert.ok(catalog.sidebar.some(c => c.id === g.category), g.id);
    for (const s of g.services) {
      assert.equal(s.groupId, g.id);
      assert.ok(Array.isArray(serviceFields(s, s.variants?.[0].id)), s.id);
    }
  }
});

test('audience tabs count captured groups, not individual subservices', () => {
  assert.deepEqual(audienceCounts(catalog.groups), {
    All: 22, Individuals: 17, Visitors: 2, Business: 9, Students: 2
  });
  for (const category of catalog.sidebar) {
    const counts = audienceCounts(catalog.groups, category.id);
    for (const audience of audiences) {
      assert.equal(filterGroups(catalog.groups, { category: category.id, audience }).length, counts[audience]);
    }
  }
});

test('search finds subservices inside their groups and combines with filters', () => {
  assert.deepEqual(filterGroups(catalog.groups, { query: '  Reporting E-Crime  ' }).map(g => g.id), ['report-criminal-complaint']);
  assert.deepEqual(filterGroups(catalog.groups, { query: 'Document Verification' }).map(g => g.id), ['inquiries-and-follow-up']);
  assert.equal(filterGroups(catalog.groups, { query: 'Reporting E-Crime', audience: 'Students' }).length, 0);
  assert.equal(filterGroups(catalog.groups, { query: 'no-such-service-xyz' }).length, 0);
});

test('api client calls the FastAPI backend instead of bundling the catalog', () => {
  const source = readFileSync(new URL('../src/api.js', import.meta.url), 'utf8');
  assert.match(source, /\/api\/v1/);
  assert.match(source, /catalog: \(\) => getJson\('\/catalog'\)/);
  assert.doesNotMatch(source, /catalog\.json/);
});

test('backend and frontend serve identical catalog data', () => {
  const backend = readFileSync(new URL('../../backend/src/ecrime_demo/resources/catalog.json', import.meta.url), 'utf8');
  assert.deepEqual(JSON.parse(backend), catalog);
});
