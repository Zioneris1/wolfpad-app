import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  try {
    // Placeholder implementation. Wire your server-side AI key here.
    const { goal, bookCount = 3, channelCount = 3, podcastCount = 3 } = req.body || {};
    if (!goal) return res.status(400).send('Missing goal');

    const plan = {
      books: Array.from({ length: bookCount }).map((_, i) => ({ title: `Book ${i + 1} for ${goal}`, authorOrChannel: 'Unknown' })),
      youtubeChannels: Array.from({ length: channelCount }).map((_, i) => ({ title: `Channel ${i + 1} for ${goal}`, authorOrChannel: 'Creator' })),
      podcasts: Array.from({ length: podcastCount }).map((_, i) => ({ title: `Podcast ${i + 1} for ${goal}`, authorOrChannel: 'Host' })),
    };
    return res.status(200).json(plan);
  } catch (e: any) {
    return res.status(500).send(e?.message || 'Server error');
  }
}

