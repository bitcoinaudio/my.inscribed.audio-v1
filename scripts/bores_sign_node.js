#!/usr/bin/env node
/*
Generate BORES HMAC auth headers.

Signature spec:
  X-BORES-SIGNATURE = HMAC_SHA256(BORES_SHARED_SECRET, `${timestamp}.${method}.${path}.${sha256(body)}`)

- timestamp: unix milliseconds
- method: HTTP method, uppercase
- path: URL path only (e.g. /v1/policies), no scheme/host, no querystring
- body: raw request bytes (exactly what will be sent)

Examples:
  BORES_SHARED_SECRET='supersecret' node scripts/bores_sign_node.js --method POST --path /v1/policies --body '{"hello":"world"}'
  node scripts/bores_sign_node.js --secret supersecret --method POST --path /v1/policies --body-file ./payload.json
*/

const crypto = require('crypto');
const fs = require('fs');

function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function hmacSha256Hex(secret, msg) {
  return crypto.createHmac('sha256', secret).update(msg).digest('hex');
}

function parseArgs(argv) {
  const args = {
    method: null,
    path: null,
    body: '',
    bodyFile: null,
    keyId: 'beatfeed',
    timestamp: null,
    secret: null,
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) throw new Error(`Missing value for ${a}`);
      return argv[++i];
    };

    if (a === '--method') args.method = next();
    else if (a === '--path') args.path = next();
    else if (a === '--body') args.body = next();
    else if (a === '--body-file') args.bodyFile = next();
    else if (a === '--key-id') args.keyId = next();
    else if (a === '--timestamp') args.timestamp = Number(next());
    else if (a === '--secret') args.secret = next();
    else if (a === '--help' || a === '-h') {
      console.log('Usage: node scripts/bores_sign_node.js --method POST --path /v1/policies [--body ... | --body-file file]');
      process.exit(0);
    } else {
      throw new Error(`Unknown arg: ${a}`);
    }
  }

  if (!args.method) throw new Error('Missing --method');
  if (!args.path) throw new Error('Missing --path');
  if (args.bodyFile && args.body) throw new Error('Use only one of --body or --body-file');
  if (Number.isNaN(args.timestamp)) throw new Error('Invalid --timestamp');

  return args;
}

function computeBoresHeaders({ secret, keyId, timestamp, method, path, bodyBytes }) {
  const ts = timestamp ?? Date.now();
  const m = String(method).toUpperCase();
  const bodyHash = sha256Hex(bodyBytes);
  const signingString = `${ts}.${m}.${path}.${bodyHash}`;
  const signature = hmacSha256Hex(secret, signingString);

  return {
    'X-BORES-KEY-ID': keyId,
    'X-BORES-TIMESTAMP': String(ts),
    'X-BORES-SIGNATURE': signature,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const secret = args.secret || process.env.BORES_SHARED_SECRET;
  if (!secret) throw new Error('Missing secret: pass --secret or set BORES_SHARED_SECRET');

  const bodyBytes = args.bodyFile
    ? fs.readFileSync(args.bodyFile)
    : Buffer.from(args.body, 'utf8');

  const headers = computeBoresHeaders({
    secret,
    keyId: args.keyId,
    timestamp: args.timestamp,
    method: args.method,
    path: args.path,
    bodyBytes,
  });

  for (const [k, v] of Object.entries(headers)) {
    console.log(`${k}: ${v}`);
  }
}

main().catch((e) => {
  console.error(String(e && e.message ? e.message : e));
  process.exit(1);
});

module.exports = { computeBoresHeaders };
