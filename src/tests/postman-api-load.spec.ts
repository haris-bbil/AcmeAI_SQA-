import { test, expect } from '@playwright/test';

// Target API we want to load test.
const apiEndpointUrl = process.env.LOAD_TARGET_URL ?? 'http://localhost:8000/generate';
const httpMethod = 'POST';
const defaultHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
};

// Request payload used for every virtual user request.
const requestPayload = {
  query: process.env.LOAD_QUERY ?? 'a',
};

// Load-test controls (can be overridden with environment variables).
const virtualUsers = Number(process.env.LOAD_CONCURRENCY ?? 50);
const requestsPerUser = Number(process.env.LOAD_ITERATIONS ?? 50);
const allowedP95LatencyMs = Number(process.env.LOAD_P95_MS ?? 1500);
const allowedErrorRate = Number(process.env.LOAD_MAX_FAILURE_RATE ?? 0.02);
const treatNon2xxAsFailure = String(process.env.LOAD_FAIL_ON_NON_2XX ?? 'true').toLowerCase() === 'true';
const maxTestDurationMs = Number(process.env.LOAD_TEST_TIMEOUT_MS ?? 300000);

type RequestResult = {
  latencyMs: number;
  status?: number;
  ok: boolean;
  reason?: string;
};

function getPercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * percentile));
  return sorted[index];
}

test('API load test for POST /generate (human-readable)', async ({ request }, testInfo) => {
  test.setTimeout(maxTestDurationMs);

  // Requirement guard: run only with 50 to 100 concurrent users.
  if (Number.isNaN(virtualUsers) || virtualUsers < 50 || virtualUsers > 100) {
    throw new Error(`LOAD_CONCURRENCY must be between 50 and 100. Received: ${virtualUsers}`);
  }

  const results: RequestResult[] = [];
  const testStartTime = Date.now();

  // Create N virtual users; each user sends M requests.
  const userTasks = Array.from({ length: virtualUsers }, async () => {
    for (let i = 0; i < requestsPerUser; i++) {
      const requestStartTime = Date.now();

      try {
        const response = await request.fetch(apiEndpointUrl, {
          method: httpMethod,
          headers: defaultHeaders,
          data: requestPayload,
        });

        const status = response.status();
        const isHttpSuccess = treatNon2xxAsFailure ? status >= 200 && status < 300 : status < 500;

        // Fail quickly if status code does not satisfy the configured policy.
        if (!isHttpSuccess) {
          results.push({ latencyMs: Date.now() - requestStartTime, status, ok: false, reason: 'http_status' });
          continue;
        }

        let payload: unknown;
        try {
          payload = await response.json();
        } catch {
          results.push({ latencyMs: Date.now() - requestStartTime, status, ok: false, reason: 'invalid_json' });
          continue;
        }

        // Basic response contract check for this API.
        const isValidPayload =
          typeof payload === 'object' &&
          payload !== null &&
          (payload as { success?: unknown }).success === true &&
          (payload as { status?: unknown }).status === 200 &&
          Array.isArray((payload as { data?: { matched_docs?: unknown } }).data?.matched_docs) &&
          ((payload as { data?: { matched_docs?: unknown[] } }).data?.matched_docs?.length ?? 0) >= 10;

        results.push({
          latencyMs: Date.now() - requestStartTime,
          status,
          ok: isValidPayload,
          reason: isValidPayload ? undefined : 'response_shape',
        });
      } catch {
        results.push({ latencyMs: Date.now() - requestStartTime, ok: false, reason: 'network_error' });
      }
    }
  });

  await Promise.all(userTasks);

  // Aggregate metrics.
  const totalRequests = results.length;
  const failedRequests = results.filter((s) => !s.ok).length;
  const successRequests = totalRequests - failedRequests;
  const failureRate = totalRequests === 0 ? 1 : failedRequests / totalRequests;

  const latencies = results.map((s) => s.latencyMs);
  const avgLatencyMs = Math.round(latencies.reduce((sum, value) => sum + value, 0) / Math.max(latencies.length, 1));
  const p95LatencyMs = Math.round(getPercentile(latencies, 0.95));

  const durationSeconds = (Date.now() - testStartTime) / 1000;
  const throughputRps = durationSeconds > 0 ? Number((totalRequests / durationSeconds).toFixed(2)) : 0;

  const statusCounts = results.reduce<Record<string, number>>((acc, s) => {
    const key = s.status ? String(s.status) : 'NETWORK_ERROR';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  // Build a readable report payload for Playwright HTML report attachment.
  const summary = {
    target: {
      url: apiEndpointUrl,
      method: httpMethod,
      body: requestPayload,
    },
    concurrency: virtualUsers,
    iterationsPerWorker: requestsPerUser,
    totalRequests,
    successRequests,
    failedRequests,
    failureRate: Number((failureRate * 100).toFixed(2)),
    avgLatencyMs,
    p95LatencyMs,
    throughputRps,
    statusCounts,
    failureReasons: results.reduce<Record<string, number>>((acc, s) => {
      if (!s.reason) {
        return acc;
      }
      acc[s.reason] = (acc[s.reason] ?? 0) + 1;
      return acc;
    }, {}),
    thresholds: {
      maxFailureRate: allowedErrorRate,
      p95ThresholdMs: allowedP95LatencyMs,
      failOnNon2xx: treatNon2xxAsFailure,
    },
  };

  const humanReadableSummary = [
    'Load Test Result Summary',
    `Endpoint: ${apiEndpointUrl}`,
    `Method: ${httpMethod}`,
    `Concurrency (virtual users): ${virtualUsers}`,
    `Iterations per user: ${requestsPerUser}`,
    `Total requests: ${totalRequests}`,
    `Successful requests: ${successRequests}`,
    `Failed requests: ${failedRequests}`,
    `Failure rate: ${(failureRate * 100).toFixed(2)}% (allowed <= ${(allowedErrorRate * 100).toFixed(2)}%)`,
    `Average latency: ${avgLatencyMs} ms`,
    `P95 latency: ${p95LatencyMs} ms (allowed <= ${allowedP95LatencyMs} ms)`,
    `Throughput: ${throughputRps} req/sec`,
    `Status counts: ${JSON.stringify(statusCounts)}`,
    `Failure reasons: ${JSON.stringify(summary.failureReasons)}`,
  ].join('\n');

  await testInfo.attach('Load Test Result Summary', {
    body: Buffer.from(humanReadableSummary, 'utf-8'),
    contentType: 'text/plain',
  });

  await testInfo.attach('API Load Test Summary', {
    body: Buffer.from(JSON.stringify(summary, null, 2), 'utf-8'),
    contentType: 'application/json',
  });

  // SLA checks.
  expect(failureRate, `Failure rate ${failureRate} exceeded ${allowedErrorRate}`).toBeLessThanOrEqual(allowedErrorRate);
  expect(p95LatencyMs, `P95 ${p95LatencyMs}ms exceeded ${allowedP95LatencyMs}ms`).toBeLessThanOrEqual(allowedP95LatencyMs);
});
