/**
 * Supported Programming Languages & Definitions for Code Sharing
 */

export const SUPPORTED_LANGUAGES = [
  {
    id: 'json',
    name: 'JSON',
    prism: 'json',
    ext: '.json',
    mime: 'application/json',
    isPrimary: true,
    sample: '{\n  "name": "JSONShare",\n  "version": "1.0.0",\n  "description": "Fast, private JSON & code snippet sharing",\n  "features": ["Zero-backend links", "Visual Graph", "Multi-language snippets"]\n}'
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    prism: 'javascript',
    ext: '.js',
    mime: 'text/javascript',
    sample: '// Modern JavaScript / ES6+\nasync function fetchUserData(userId) {\n  try {\n    const response = await fetch(`https://api.example.com/users/${userId}`);\n    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);\n    const data = await response.json();\n    console.log("Fetched user:", data.name);\n    return data;\n  } catch (err) {\n    console.error("Failed to load user:", err);\n  }\n}\n\nfetchUserData("usr_42");'
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    prism: 'typescript',
    ext: '.ts',
    mime: 'text/plain',
    sample: 'export interface UserProfile {\n  id: string;\n  username: string;\n  email: string;\n  roles: ("admin" | "editor" | "viewer")[];\n  isActive: boolean;\n  createdAt: Date;\n}\n\nexport function formatUserBadge(user: UserProfile): string {\n  const primaryRole = user.roles[0] ?? "guest";\n  return `[${primaryRole.toUpperCase()}] ${user.username} <${user.email}>`;\n}'
  },
  {
    id: 'python',
    name: 'Python',
    prism: 'python',
    ext: '.py',
    mime: 'text/x-python',
    sample: 'from dataclasses import dataclass\nfrom typing import List, Optional\nimport json\n\n@dataclass\nclass PipelineConfig:\n    name: str\n    batch_size: int = 128\n    workers: int = 4\n    tags: Optional[List[str]] = None\n\ndef run_pipeline(config: PipelineConfig) -> dict:\n    print(f"Starting pipeline: {config.name} with {config.workers} workers")\n    results = {"status": "success", "processed": 1024, "config": config.__dict__}\n    return results\n\nif __name__ == "__main__":\n    cfg = PipelineConfig(name="etl_ingestion_v2", tags=["prod", "analytics"])\n    output = run_pipeline(cfg)\n    print(json.dumps(output, indent=2))'
  },
  {
    id: 'sql',
    name: 'SQL',
    prism: 'sql',
    ext: '.sql',
    mime: 'text/x-sql',
    sample: '-- Analytics Query: Monthly Revenue & Active Subscriptions\nWITH monthly_stats AS (\n  SELECT\n    DATE_TRUNC(\'month\', o.created_at) AS order_month,\n    o.customer_id,\n    SUM(o.amount_cents) / 100.0 AS total_revenue,\n    COUNT(DISTINCT o.id) AS total_orders\n  FROM orders o\n  WHERE o.status = \'completed\'\n    AND o.created_at >= NOW() - INTERVAL \'12 months\'\n  GROUP BY 1, 2\n)\nSELECT\n  order_month,\n  COUNT(DISTINCT customer_id) AS active_customers,\n  ROUND(SUM(total_revenue), 2) AS total_revenue_usd,\n  ROUND(AVG(total_revenue), 2) AS avg_revenue_per_user\nFROM monthly_stats\nGROUP BY order_month\nORDER BY order_month DESC;'
  },
  {
    id: 'yaml',
    name: 'YAML',
    prism: 'yaml',
    ext: '.yaml',
    mime: 'text/yaml',
    sample: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: api-gateway\n  labels:\n    app: gateway\n    tier: backend\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: gateway\n  template:\n    metadata:\n      labels:\n        app: gateway\n    spec:\n      containers:\n        - name: gateway-server\n          image: nginx:alpine\n          ports:\n            - containerPort: 80\n          resources:\n            limits:\n              memory: "256Mi"\n              cpu: "500m"'
  },
  {
    id: 'html',
    name: 'HTML',
    prism: 'markup',
    ext: '.html',
    mime: 'text/html',
    sample: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Shared Snippet Preview</title>\n  <style>\n    body { font-family: system-ui, sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc; }\n    .card { background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <h1>Hello from JSONShare!</h1>\n    <p>Zero-backend instant snippet & payload sharing.</p>\n  </div>\n</body>\n</html>'
  },
  {
    id: 'css',
    name: 'CSS',
    prism: 'css',
    ext: '.css',
    mime: 'text/css',
    sample: '/* Modern Glassmorphic Card Styling */\n.glass-panel {\n  background: rgba(22, 27, 34, 0.85);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 16px;\n  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);\n  padding: 24px;\n  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);\n}\n\n.glass-panel:hover {\n  transform: translateY(-2px);\n  border-color: rgba(13, 180, 158, 0.4);\n}'
  },
  {
    id: 'go',
    name: 'Go',
    prism: 'go',
    ext: '.go',
    mime: 'text/x-go',
    sample: 'package main\n\nimport (\n\t"encoding/json"\n\t"fmt"\n\t"net/http"\n)\n\ntype HealthResponse struct {\n\tStatus    string `json:"status"`\n\tTimestamp int64  `json:"timestamp"`\n\tVersion   string `json:"version"`\n}\n\nfunc healthHandler(w http.ResponseWriter, r *http.Request) {\n\tw.Header().Set("Content-Type", "application/json")\n\tres := HealthResponse{\n\t\tStatus:  "ok",\n\t\tVersion: "1.0.0",\n\t}\n\tjson.NewEncoder(w).Encode(res)\n}\n\nfunc main() {\n\thttp.HandleFunc("/health", healthHandler)\n\tfmt.Println("Server listening on :8080...")\n\thttp.ListenAndServe(":8080", nil)\n}'
  },
  {
    id: 'rust',
    name: 'Rust',
    prism: 'rust',
    ext: '.rs',
    mime: 'text/rust',
    sample: 'use serde::{Deserialize, Serialize};\n\n#[derive(Debug, Serialize, Deserialize)]\npub struct ServicePayload {\n    pub service_id: String,\n    pub latency_ms: u64,\n    pub is_healthy: bool,\n}\n\nfn process_event(raw_json: &str) -> Result<ServicePayload, serde_json::Error> {\n    let payload: ServicePayload = serde_json::from_str(raw_json)?;\n    println!("Processed payload for: {}", payload.service_id);\n    Ok(payload)\n}\n\nfn main() {\n    let data = r#"{"service_id": "auth-api", "latency_ms": 14, "is_healthy": true}"#;\n    match process_event(data) {\n        Ok(p) => println!("Success: {:?}", p),\n        Err(e) => eprintln!("Error: {}", e),\n    }\n}'
  },
  {
    id: 'bash',
    name: 'Bash',
    prism: 'bash',
    ext: '.sh',
    mime: 'text/x-sh',
    sample: '#!/usr/bin/env bash\nset -euo pipefail\n\nAPP_NAME="json-share"\nDEPLOY_ENV="${1:-production}"\n\necho "🚀 Starting deployment for ${APP_NAME} [${DEPLOY_ENV}]..."\n\n# Run build verification\nnpm run build\necho "✅ Build completed successfully."\n\n# Health check probe\ncurl -fsSL "https://api.example.com/healthz" || {\n  echo "❌ Health check failed!"\n  exit 1\n}\necho "🎉 Service deployed and verified."'
  },
  {
    id: 'markdown',
    name: 'Markdown',
    prism: 'markdown',
    ext: '.md',
    mime: 'text/markdown',
    sample: '# Project Overview\n\nA modern, privacy-focused developer utility for inspecting and sharing **JSON payloads** and **code snippets** with zero backend storage.\n\n### Key Features\n- ⚡ **Zero-Backend Sharing**: Payload compressed directly in URL hash.\n- 🔒 **Client-Side AES-256**: Encrypt sensitive payloads with a passphrase.\n- 📊 **Visual Graph & Tree**: Interactive structural inspection.\n- 💻 **Multi-Language Snippets**: Share Python, SQL, JS, Go, Rust, and more.'
  },
  {
    id: 'java',
    name: 'Java',
    prism: 'java',
    ext: '.java',
    mime: 'text/x-java-source',
    sample: 'package com.example.service;\n\nimport java.time.Instant;\n\npublic class ShareRecord {\n    private final String id;\n    private final String language;\n    private final Instant timestamp;\n\n    public ShareRecord(String id, String language) {\n        this.id = id;\n        this.language = language;\n        this.timestamp = Instant.now();\n    }\n\n    public String getId() { return id; }\n    public String getLanguage() { return language; }\n    public Instant getTimestamp() { return timestamp; }\n}'
  },
  {
    id: 'cpp',
    name: 'C / C++',
    prism: 'cpp',
    ext: '.cpp',
    mime: 'text/x-c',
    sample: '#include <iostream>\n#include <vector>\n#include <string>\n\nstruct Snippet {\n    std::string title;\n    std::string language;\n    size_t line_count;\n};\n\nint main() {\n    std::vector<Snippet> items = {\n        {"Quick Sort", "cpp", 42},\n        {"JWT Authenticator", "go", 78}\n    };\n\n    for (const auto& item : items) {\n        std::cout << "Snippet: " << item.title << " (" << item.language << ")\n";\n    }\n    return 0;\n}'
  },
  {
    id: 'csharp',
    name: 'C#',
    prism: 'csharp',
    ext: '.cs',
    mime: 'text/plain',
    sample: 'using System;\nusing System.Text.Json;\n\nnamespace JsonShare.App\n{\n    public record SnippetPayload(string Id, string Language, string Content, DateTime CreatedAt);\n\n    public class Program\n    {\n        public static void Main()\n        {\n            var payload = new SnippetPayload("snip_101", "csharp", "// code", DateTime.UtcNow);\n            string json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });\n            Console.WriteLine(json);\n        }\n    }\n}'
  },
  {
    id: 'php',
    name: 'PHP',
    prism: 'php',
    ext: '.php',
    mime: 'text/x-php',
    sample: '<?php\ndeclare(strict_types=1);\n\nclass PayloadResponse {\n    public function __construct(\n        public readonly string $status,\n        public readonly array $data\n    ) {}\n\n    public function send(): void {\n        header("Content-Type: application/json");\n        echo json_encode([\n            "status" => $this->status,\n            "data" => $this->data,\n            "timestamp" => time()\n        ], JSON_PRETTY_PRINT);\n    }\n}\n\n$res = new PayloadResponse("success", ["item" => "Shared code snippet"]);\n$res->send();'
  },
  {
    id: 'plaintext',
    name: 'Plain Text',
    prism: 'plaintext',
    ext: '.txt',
    mime: 'text/plain',
    sample: 'This is a simple plain text document.\nShare notes, logs, stack traces, or raw output with teammates easily.'
  }
]

export function getLanguageById(id) {
  if (!id) return SUPPORTED_LANGUAGES[0]
  const found = SUPPORTED_LANGUAGES.find(l => l.id.toLowerCase() === id.toLowerCase())
  return found || SUPPORTED_LANGUAGES[0]
}

/**
 * Heuristics to intelligently detect if code is Python, SQL, HTML, YAML, JS/TS, Bash, or JSON
 */
export function detectLanguage(code) {
  if (!code || typeof code !== 'string') return null
  const trimmed = code.trim()
  if (!trimmed) return null

  // Check valid JSON first
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {
      // Might still be JSON or Python dict / JS object
    }
  }

  // HTML detection
  if (/^<!DOCTYPE\s+html/i.test(trimmed) || /<html[\s>]/i.test(trimmed) || (trimmed.startsWith('<') && trimmed.endsWith('>') && /<\/(div|p|body|head|span|h[1-6]|section)>/i.test(trimmed))) {
    return 'html'
  }

  // Python detection
  if (
    /^(def |class |import |from \w+ import |if __name__ == )/m.test(trimmed) ||
    /:\s*$/m.test(trimmed) && /\b(def|class|elif|else|except|finally|with)\b/.test(trimmed) ||
    /\bprint\(/.test(trimmed) && !/console\.log/.test(trimmed)
  ) {
    return 'python'
  }

  // SQL detection
  if (/^\s*(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|WITH\s+\w+\s+AS)\b/i.test(trimmed)) {
    return 'sql'
  }

  // Bash detection
  if (/^#!\/bin\/(bash|sh|zsh)/.test(trimmed) || /\b(set -e|echo "|export [A-Z0-9_]+=)/.test(trimmed)) {
    return 'bash'
  }

  // YAML detection
  if (/^---\s*$/m.test(trimmed) || (/^[a-zA-Z0-9_-]+:\s+/m.test(trimmed) && !trimmed.startsWith('{') && !trimmed.includes(';'))) {
    if (!trimmed.includes('{') && !trimmed.includes('function') && !trimmed.includes('class ')) {
      return 'yaml'
    }
  }

  // TypeScript / JavaScript detection
  if (/\b(interface|type\s+\w+\s*=|const\s+\w+:\s*[A-Z]|enum\s+\w+)\b/.test(trimmed)) {
    return 'typescript'
  }

  if (/\b(const|let|var|function|export\s+(default|const|function)|import\s+.*\s+from)\b/.test(trimmed)) {
    return 'javascript'
  }

  // Rust detection
  if (/\b(fn\s+\w+|pub\s+struct|impl\s+\w+|let\s+mut|match\s+\w+)\b/.test(trimmed)) {
    return 'rust'
  }

  // Go detection
  if (/\b(package\s+\w+|func\s+\w+|type\s+\w+\s+struct)\b/.test(trimmed)) {
    return 'go'
  }

  return null
}
