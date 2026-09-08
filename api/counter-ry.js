export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  const owner = 'katanatripp';
  const repo = 'vcprison';
  const path = 'data/counter-ry.json'; // separate file for ry counter

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    ...(token ? { 'Authorization': `token ${token}` } : {}),
  };

  try {
    if (req.method === 'POST') {
      if (!token) {
        return res.status(500).json({ error: 'GITHUB_TOKEN is not set in the Vercel project env vars — writing requires auth.' });
      }

      const getFile = await fetch(apiUrl, { headers });
      const fileData = await getFile.json();
      if (!getFile.ok || !fileData.content) {
        return res.status(502).json({ error: 'GitHub GET failed', status: getFile.status, details: fileData });
      }
      const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
      const newCount = content.count + 1;

      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: 'Update ry counter',
          content: Buffer.from(JSON.stringify({ count: newCount }, null, 2)).toString('base64'),
          sha: fileData.sha
        }),
      });
      const putData = await putRes.json();
      if (!putRes.ok) {
        return res.status(502).json({ error: 'GitHub PUT failed', status: putRes.status, details: putData });
      }

      return res.status(200).json({ count: newCount });
    }

    if (req.method === 'GET') {
      const file = await fetch(apiUrl, { headers });
      const fileData = await file.json();
      if (!file.ok || !fileData.content) {
        return res.status(502).json({ error: 'GitHub GET failed', status: file.status, details: fileData });
      }
      const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
      return res.status(200).json({ count: content.count });
    }

    res.status(405).end();
  } catch (err) {
    return res.status(500).json({ error: 'Unhandled exception', message: err.message });
  }
}
