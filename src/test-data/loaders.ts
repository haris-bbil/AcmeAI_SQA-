import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CoreTestingCase } from './types';

const LONG_PAYLOAD_TOKEN = '__LONG_A_10000__';

export function loadCoreTestingCases(): CoreTestingCase[] {
  const dataPath = resolve(process.cwd(), 'data', 'homePageSecurityTest.json');
  const raw = readFileSync(dataPath, 'utf-8');
  const parsed = JSON.parse(raw) as CoreTestingCase[];

  return parsed.map((item) => ({
    ...item,
    payload: item.payload === LONG_PAYLOAD_TOKEN ? 'a'.repeat(10_000) : item.payload,
  }));
}
