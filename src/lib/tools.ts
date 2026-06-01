export type ToolCategory =
  | 'developer'
  | 'network'
  | 'converter'
  | 'generator'
  | 'security'
  | 'text';

export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  tags: string[];
  isNew?: boolean;
  requiresServer?: boolean;
};

export const tools: Tool[] = [
  // Phase 1 — Pure client
  {
    slug: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test regular expressions with live match highlighting and group capture.',
    category: 'developer',
    tags: ['regex', 'regexp', 'pattern', 'match', 'test'],
    isNew: true,
  },
  {
    slug: 'jwt-debugger',
    name: 'JWT Debugger',
    description: 'Decode JWT header and payload, verify expiry, inspect claims.',
    category: 'security',
    tags: ['jwt', 'token', 'auth', 'decode', 'bearer'],
    isNew: true,
  },
  {
    slug: 'diff-checker',
    name: 'Diff Checker',
    description: 'Compare two blocks of text side-by-side with per-line highlighting.',
    category: 'developer',
    tags: ['diff', 'compare', 'text', 'changes', 'delta'],
    isNew: true,
  },
  {
    slug: 'rupiah-formatter',
    name: 'Rupiah Formatter',
    description: 'Format numbers as Indonesian Rupiah and convert to terbilang.',
    category: 'converter',
    tags: ['rupiah', 'idr', 'currency', 'indonesia', 'terbilang', 'format'],
    isNew: true,
  },
  {
    slug: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert Unix timestamps to human-readable dates across timezones.',
    category: 'converter',
    tags: ['timestamp', 'unix', 'datetime', 'epoch', 'timezone', 'iso8601'],
    isNew: true,
  },
  {
    slug: 'url-encoder',
    name: 'URL Encoder / Decoder',
    description: 'Encode or decode URLs and parse query strings into a table.',
    category: 'developer',
    tags: ['url', 'encode', 'decode', 'query', 'string', 'percent'],
    isNew: true,
  },
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes via Web Crypto.',
    category: 'security',
    tags: ['hash', 'md5', 'sha256', 'sha512', 'crypto', 'checksum'],
    isNew: true,
  },
  {
    slug: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text between camelCase, PascalCase, snake_case, and kebab-case.',
    category: 'text',
    tags: ['case', 'camel', 'pascal', 'snake', 'kebab', 'screaming'],
    isNew: true,
  },
  {
    slug: 'color-converter',
    name: 'Color Picker & Converter',
    description: 'Pick colors and convert between HEX, RGB, and HSL formats.',
    category: 'converter',
    tags: ['color', 'hex', 'rgb', 'hsl', 'picker', 'css'],
    isNew: true,
  },
  {
    slug: 'base64',
    name: 'Base64 Encoder / Decoder',
    description: 'Encode or decode text and files to Base64, with image preview.',
    category: 'converter',
    tags: ['base64', 'encode', 'decode', 'binary', 'file', 'image'],
    isNew: true,
  },
  {
    slug: 'csv-json',
    name: 'CSV ↔ JSON Converter',
    description: 'Upload or paste CSV, preview as a table, and download as JSON.',
    category: 'converter',
    tags: ['csv', 'json', 'table', 'convert', 'data', 'import'],
    isNew: true,
  },
  {
    slug: 'password-generator',
    name: 'Password Generator',
    description: 'Generate strong passwords with custom length, charset, and entropy meter.',
    category: 'security',
    tags: ['password', 'generate', 'entropy', 'security', 'random'],
    isNew: true,
  },
  {
    slug: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes from any text or URL and download as PNG.',
    category: 'generator',
    tags: ['qr', 'qrcode', 'barcode', 'url', 'link', 'generate'],
    isNew: true,
  },
  {
    slug: 'markdown-preview',
    name: 'Markdown Previewer',
    description: 'Write Markdown in a split editor and preview rendered output live.',
    category: 'text',
    tags: ['markdown', 'md', 'preview', 'render', 'html', 'editor'],
    isNew: true,
  },
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate UUIDs v1/v4/v7, ULIDs, and nanoids in bulk.',
    category: 'generator',
    tags: ['uuid', 'guid', 'ulid', 'nanoid', 'id', 'unique', 'generate'],
    isNew: true,
  },

  // Phase 2 — Route handler required
  {
    slug: 'http-headers',
    name: 'HTTP Headers Inspector',
    description: 'Fetch and inspect all HTTP response headers for any URL.',
    category: 'network',
    tags: ['http', 'headers', 'request', 'response', 'inspect'],
    requiresServer: true,
  },
  {
    slug: 'ssl-checker',
    name: 'SSL Checker',
    description: 'Check SSL certificate expiry, issuer, and grade for any domain.',
    category: 'network',
    tags: ['ssl', 'tls', 'certificate', 'https', 'expiry', 'domain'],
    requiresServer: true,
  },
  {
    slug: 'whois',
    name: 'WHOIS Lookup',
    description: 'Look up domain registration info, registrar, and expiry date.',
    category: 'network',
    tags: ['whois', 'domain', 'registrar', 'dns', 'lookup'],
    requiresServer: true,
  },
  {
    slug: 'cors-tester',
    name: 'CORS Header Tester',
    description: 'Simulate a preflight request and get CORS fix suggestions.',
    category: 'network',
    tags: ['cors', 'preflight', 'headers', 'access-control', 'api'],
    requiresServer: true,
  },

  // Phase 3 — Enhanced tools
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON with syntax highlighting.',
    category: 'developer',
    tags: ['json', 'format', 'validate', 'minify', 'pretty', 'lint'],
  },
  {
    slug: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Format and beautify SQL queries for readability.',
    category: 'developer',
    tags: ['sql', 'query', 'format', 'beautify', 'database'],
  },
  {
    slug: 'cron-generator',
    name: 'Cron Expression Generator',
    description: 'Build cron schedules visually and get a human-readable description.',
    category: 'developer',
    tags: ['cron', 'schedule', 'expression', 'job', 'task'],
  },
  {
    slug: 'subnet-calculator',
    name: 'Subnet Calculator',
    description: 'Calculate IPv4 subnet ranges, broadcast, and host counts.',
    category: 'network',
    tags: ['subnet', 'cidr', 'ipv4', 'network', 'mask', 'ip'],
  },
  {
    slug: 'dns-propagation',
    name: 'DNS Propagation Checker',
    description: 'Check DNS record propagation across global nameservers.',
    category: 'network',
    tags: ['dns', 'propagation', 'nameserver', 'record', 'domain'],
    requiresServer: true,
  },
  {
    slug: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text by paragraphs, sentences, or words.',
    category: 'generator',
    tags: ['lorem', 'ipsum', 'placeholder', 'text', 'dummy'],
  },
  {
    slug: 'duplicate-line-remover',
    name: 'Duplicate Line Remover',
    description: 'Remove or highlight duplicate lines from any block of text.',
    category: 'text',
    tags: ['duplicate', 'lines', 'unique', 'remove', 'dedupe'],
  },
];

export const categoryLabels: Record<ToolCategory, string> = {
  developer: 'Developer',
  network: 'Network',
  converter: 'Converter',
  generator: 'Generator',
  security: 'Security',
  text: 'Text',
};
