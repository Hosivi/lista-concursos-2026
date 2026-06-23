import { Redis } from '@upstash/redis';

// Single shared decision set for the whole group, stored as one Redis hash.
// Field = contest id (d0, d1, ...). Value = 'y' | 'n' | 'm'.
// Saving field-by-field (not the whole blob) means two people editing at the
// same time never overwrite each other's contests.
const HASH = 'concursos2026';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await redis.hgetall(HASH);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(data || {});
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

      if (body.clear === true) {
        await redis.del(HASH);
        return res.status(200).json({ ok: true, cleared: true });
      }

      const { name, value } = body;
      // Reject anything that is not a real contest id / valid decision so a
      // public endpoint can't be filled with arbitrary junk.
      if (!/^d\d+$/.test(String(name)) || !['y', 'n', 'm'].includes(value)) {
        return res.status(400).json({ error: 'invalid name or value' });
      }

      await redis.hset(HASH, { [name]: value });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'server error', detail: String(err && err.message || err) });
  }
}
