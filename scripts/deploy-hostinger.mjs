import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

const token = process.env.HOSTINGER_API_TOKEN;
const username = process.env.HOSTINGER_USERNAME || 'u649191426';
const domain = process.env.HOSTINGER_DOMAIN || 'crew.nextwavefusion.com';
const archivePath = process.argv[2];
const apiBase = 'https://developers.hostinger.com/api/hosting/v1';

if (!token) throw new Error('HOSTINGER_API_TOKEN is required.');
if (!archivePath) throw new Error('Usage: node scripts/deploy-hostinger.mjs <archive>');

const apiHeaders = {
  Accept: 'application/json',
  Authorization: `Bearer ${token}`,
};

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} failed (${response.status}): ${body?.message || body?.error || text}`);
  }
  return { response, body };
}

const archiveName = basename(archivePath);
const archive = await readFile(archivePath);

console.log(`Uploading ${archiveName} for ${domain}...`);
const { body: uploadCredentials } = await request(`${apiBase}/files/upload-urls`, {
  method: 'POST',
  headers: { ...apiHeaders, 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, domain }),
});

const uploadUrl = `${uploadCredentials.url.replace(/\/$/, '')}/${encodeURIComponent(archiveName)}?override=true`;
const uploadHeaders = {
  'X-Auth': uploadCredentials.auth_key,
  'X-Auth-Rest': uploadCredentials.rest_auth_key,
  'Tus-Resumable': '1.0.0',
};

const createResponse = await fetch(uploadUrl, {
  method: 'POST',
  headers: {
    ...uploadHeaders,
    'Upload-Length': String(archive.length),
    'Upload-Offset': '0',
  },
});
if (createResponse.status !== 201) {
  throw new Error(`Archive upload initialization failed (${createResponse.status}): ${await createResponse.text()}`);
}

const headResponse = await fetch(uploadUrl, { method: 'HEAD', headers: uploadHeaders });
if (!headResponse.ok) throw new Error(`Archive upload status failed (${headResponse.status}).`);
const offset = Number(headResponse.headers.get('upload-offset') || 0);

const patchResponse = await fetch(uploadUrl, {
  method: 'PATCH',
  headers: {
    ...uploadHeaders,
    'Content-Type': 'application/offset+octet-stream',
    'Upload-Offset': String(offset),
  },
  body: archive.subarray(offset),
});
if (!patchResponse.ok) {
  throw new Error(`Archive upload failed (${patchResponse.status}): ${await patchResponse.text()}`);
}

const websitePath = `${apiBase}/accounts/${encodeURIComponent(username)}/websites/${encodeURIComponent(domain)}/nodejs`;
const { body: detectedSettings } = await request(
  `${websitePath}/builds/settings/from-archive?archive_path=${encodeURIComponent(archiveName)}`,
  { headers: apiHeaders },
);

const { body: build } = await request(`${websitePath}/builds`, {
  method: 'POST',
  headers: { ...apiHeaders, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...detectedSettings,
    node_version: 22,
    source_type: 'archive',
    source_options: { archive_path: archiveName },
  }),
});

const buildUuid = build.uuid || build.data?.uuid;
if (!buildUuid) throw new Error('Hostinger accepted the build but returned no build identifier.');
console.log(`Hostinger build started: ${buildUuid}`);

const deadline = Date.now() + 20 * 60 * 1000;
while (Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, 15000));
  const { body: builds } = await request(`${websitePath}/builds?per_page=100`, { headers: apiHeaders });
  const current = builds.data?.find((item) => item.uuid === buildUuid);
  if (!current) continue;
  console.log(`Hostinger build state: ${current.state}`);
  if (current.state === 'completed') process.exit(0);
  if (current.state === 'failed') {
    const { body: logs } = await request(`${websitePath}/builds/${buildUuid}/logs`, { headers: apiHeaders });
    console.error(logs.output || logs.data || logs);
    process.exit(1);
  }
}

throw new Error('Hostinger build timed out after 20 minutes.');
