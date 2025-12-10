export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  const owner = 'katanatripp';
  const repo = 'vcprison';
  const path = 'data/counter-ry.json'; // separate file for ry counter

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  if (req.method === 'POST') {
    const getFile = await fetch(apiUrl, { headers });
    const fileData = await getFile.json();
    const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
    const newCount = content.count + 1;

    await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'Update ry counter',
        content: Buffer.from(JSON.stringify({ count: newCount }, null, 2)).toString('base64'),
        sha: fileData.sha
      }),
    });

    return res.status(200).json({ count: newCount });
  }

  if (req.method === 'GET') {
    const file = await fetch(apiUrl, { headers });
    const fileData = await file.json();
    const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
    return res.status(200).json({ count: content.count });
  }

  res.status(405).end();
}
