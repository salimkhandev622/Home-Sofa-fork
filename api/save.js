export default async function handler(req, res) {
    // Enable CORS for GitHub Pages and all origins
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const { filePath, content, message } = req.body || {};

    if (!filePath || !content) {
        return res.status(400).json({ error: 'Missing required parameters: filePath and content' });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER || 'salimkhandev622';
    const repo = process.env.GITHUB_REPO || 'Home-Sofa-fork';
    const branch = process.env.GITHUB_BRANCH || 'main';

    if (!token) {
        return res.status(500).json({ 
            error: 'Server configuration error: GITHUB_TOKEN environment variable is missing on Vercel.' 
        });
    }

    try {
        // 1. Check if the target file exists to fetch its current SHA
        let sha = null;
        try {
            const getFileResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}&t=${Date.now()}`,
                {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (getFileResponse.ok) {
                const fileData = await getFileResponse.json();
                sha = fileData.sha;
            }
        } catch (fetchErr) {
            console.log(`File ${filePath} not found on remote, will create new.`);
        }

        // 2. Commit the new or updated file
        const putData = {
            message: message || `Update ${filePath} via Vercel Admin API`,
            content: content,
            branch: branch
        };

        if (sha) {
            putData.sha = sha;
        }

        const putResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(putData)
            }
        );

        if (!putResponse.ok) {
            const errorText = await putResponse.text();
            console.error('GitHub API error:', errorText);
            return res.status(putResponse.status).json({ 
                error: `GitHub API error (${putResponse.status}): ${errorText}` 
            });
        }

        const result = await putResponse.json();
        return res.status(200).json({ 
            success: true, 
            message: `Successfully committed ${filePath}`,
            commit: result.commit 
        });
    } catch (error) {
        console.error('API Handler error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
