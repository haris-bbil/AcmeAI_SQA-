import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CoreTestingCase, PostmanRequestCase } from './types';

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

type PostmanCollectionItem = {
  name?: string;
  request?: {
    method?: string;
    header?: Array<{ key?: string; value?: string }>;
    body?: { mode?: string; raw?: string };
    url?: string | { raw?: string };
  };
  item?: PostmanCollectionItem[];
};

type PostmanCollection = {
  item?: PostmanCollectionItem[];
};

function flattenPostmanItems(items: PostmanCollectionItem[] = []): PostmanCollectionItem[] {
  const output: PostmanCollectionItem[] = [];
  for (const item of items) {
    if (item.request) {
      output.push(item);
    }
    if (Array.isArray(item.item)) {
      output.push(...flattenPostmanItems(item.item));
    }
  }
  return output;
}

function interpolatePostmanVariables(value: string): string {
  return value.replace(/{{\s*([A-Za-z0-9_]+)\s*}}/g, (_match, variableName: string) => {
    return process.env[variableName] ?? `{{${variableName}}}`;
  });
}

function parseRequestBody(rawBody?: string): unknown {
  if (!rawBody || rawBody.trim() === '') {
    return undefined;
  }

  const interpolated = interpolatePostmanVariables(rawBody);
  try {
    return JSON.parse(interpolated);
  } catch {
    return interpolated;
  }
}

/**
 * Loads request definitions from a Postman collection JSON file.
 * Supports normal request entries (not dynamic pre-request scripting).
 */
export function loadPostmanRequestCases(
  collectionRelativePath = 'postman/collections/ACME AI.postman_collection.json'
): PostmanRequestCase[] {
  const collectionPath = resolve(process.cwd(), collectionRelativePath);
  const raw = readFileSync(collectionPath, 'utf-8');
  const collection = JSON.parse(raw) as PostmanCollection;

  const requestItems = flattenPostmanItems(collection.item);
  if (requestItems.length === 0) {
    throw new Error(`No executable requests found in Postman collection: ${collectionRelativePath}`);
  }

  return requestItems.map((item) => {
    const method = item.request?.method?.toUpperCase() ?? 'GET';
    const requestUrl =
      typeof item.request?.url === 'string' ? item.request.url : item.request?.url?.raw ?? '';
    const url = interpolatePostmanVariables(requestUrl);

    if (!url) {
      throw new Error(`Postman request "${item.name ?? 'unknown'}" does not have a valid URL.`);
    }

    const headers = (item.request?.header ?? [])
      .filter((h) => Boolean(h.key))
      .map((h) => ({
        key: String(h.key),
        value: interpolatePostmanVariables(String(h.value ?? '')),
      }));

    const body = item.request?.body?.mode === 'raw' ? parseRequestBody(item.request.body.raw) : undefined;

    return {
      name: item.name ?? url,
      method,
      url,
      headers,
      body,
    };
  });
}
