import { config } from 'dotenv';
import { resolve } from 'path';
import { put, get, del } from '@vercel/blob';
import { performance } from 'perf_hooks';

config({ path: resolve(process.cwd(), 'apps/admin/.env') });

async function run() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) throw new Error('No BLOB_READ_WRITE_TOKEN');

  const payload = Buffer.alloc(20 * 1024, 'x');
  const path = `test-blob-connectivity/${Date.now()}.bin`;

  console.log('token exists:', Boolean(token));
  console.log('starting put...', path);

  const abortController = new AbortController();
  const timeout = setTimeout(() => {
    abortController.abort();
  }, 15000);

  const putStart = performance.now();

  try {
    const blob = await put(path, payload, {
      access: 'private',
      contentType: 'application/octet-stream',
      token,
      abortSignal: abortController.signal,
    });

    console.log('put done in', Math.round(performance.now() - putStart), 'ms');
    console.log('blob url:', blob.url);

    const getStart = performance.now();
    const result = await get(blob.url, { access: 'private', token });
    console.log('get headers in', Math.round(performance.now() - getStart), 'ms');

    if (!result?.stream) throw new Error('No stream');

    const reader = result.stream.getReader();
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value?.length ?? 0;
    }

    console.log('downloaded bytes:', total);

    await del(blob.url, { token });
    console.log('delete done');
  } finally {
    clearTimeout(timeout);
  }
}

run().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});