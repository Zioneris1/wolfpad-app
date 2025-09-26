import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  try {
    const { goal, resourceToReplace } = req.body || {};
    if (!goal || !resourceToReplace) return res.status(400).send('Missing goal or resourceToReplace');
    const suggestion = {
      title: `Alternative for ${resourceToReplace}`,
      authorOrChannel: 'AI Curator'
    };
    return res.status(200).json(suggestion);
  } catch (e: any) {
    return res.status(500).send(e?.message || 'Server error');
  }
}

