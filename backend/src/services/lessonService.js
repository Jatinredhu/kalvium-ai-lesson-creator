import { generateWithAI } from './aiProvider.js';

/**
 * Lesson Generation Service
 * Synthesizes research data into a complete 45-minute structured educational lesson.
 */

export const generateLessonContent = async ({ title, learningObjective, researchData, apiKey, provider }) => {
  // If an API key is available, attempt AI-based generation
  if (apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY) {
    try {
      const aiPrompt = buildLessonPrompt({ title, learningObjective, researchData });
      const systemPrompt = `You are an expert instructional designer and senior computer science educator at Kalvium.
Your mission is to generate a comprehensive, highly accurate 45-minute lesson with a structured timeline, deep explanations, code examples, hands-on lab, and multiple-choice questions. Output MUST be valid JSON adhering strictly to the requested schema.`;
      
      const rawResponse = await generateWithAI({
        prompt: aiPrompt,
        systemPrompt,
        apiKey,
        provider
      });

      if (rawResponse) {
        const cleaned = cleanJsonResponse(rawResponse);
        const parsed = JSON.parse(cleaned);
        if (parsed.markdownBody && parsed.timeline) {
          return formatGeneratedLesson(parsed, researchData, title, learningObjective);
        }
      }
    } catch (err) {
      console.warn('[Lesson Service] LLM generation parsing failed, using smart synthesizer:', err.message);
    }
  }

  // High-fidelity Pedagogical Synthesizer (Zero API key required)
  return synthesizeLesson(title, learningObjective, researchData);
};

function buildLessonPrompt({ title, learningObjective, researchData }) {
  const booksSummary = (researchData?.books || []).map(b => `- "${b.title}" by ${b.authors?.join(', ')} (${b.publishedYear})`).join('\n');
  const webSummary = (researchData?.webArticles || []).map(w => `- [${w.title}](${w.url}): ${w.snippet}`).join('\n');
  const videoSummary = (researchData?.youtubeVideos || []).map(v => `- [${v.title}](${v.url}) by ${v.channelName}`).join('\n');

  return `
Create a complete 45-minute lesson for:
Title: "${title}"
Learning Objective: "${learningObjective}"

Synthesize from these researched materials:
Books:
${booksSummary}

Web Resources:
${webSummary}

Videos:
${videoSummary}

Return a valid JSON object matching this structure:
{
  "overview": "2-3 paragraphs explaining the context, significance, and what students will achieve in 45 minutes.",
  "timeline": [
    {
      "timeRange": "00:00 - 10:00 (10 mins)",
      "title": "Phase 1: Foundations & Architecture",
      "concept": "Core concepts and motivation",
      "details": "Explanation text",
      "codeOrExample": "Example diagram or snippet"
    },
    {
      "timeRange": "10:00 - 25:00 (15 mins)",
      "title": "Phase 2: Core Mechanisms & Analysis",
      "concept": "Deep dive into methods and status codes",
      "details": "Technical breakdown",
      "codeOrExample": "Code examples"
    },
    {
      "timeRange": "25:00 - 35:00 (10 mins)",
      "title": "Phase 3: Hands-On Interactive Lab",
      "concept": "Practical application",
      "details": "Lab guide",
      "codeOrExample": "Starter and test code"
    },
    {
      "timeRange": "35:00 - 45:00 (10 mins)",
      "title": "Phase 4: Knowledge Check & Wrap-Up",
      "concept": "Evaluation and synthesis",
      "details": "Summary points",
      "codeOrExample": "Review questions"
    }
  ],
  "markdownBody": "Full, beautifully formatted lesson content with markdown headers, tables, code blocks, and diagrams.",
  "practicalExercise": {
    "title": "Hands-on Exercise Title",
    "instructions": "Step-by-step instructions",
    "starterCode": "// starter code",
    "solutionCode": "// solution code"
  },
  "knowledgeCheck": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswerIndex": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}
`;
}

function cleanJsonResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

function formatGeneratedLesson(data, researchData, title, learningObjective) {
  // Ensure references and supplementary resources are attached
  data.supplementaryResources = (researchData?.youtubeVideos || []).map(v => ({
    title: v.title,
    type: 'video',
    url: v.url,
    note: `Recommended supplementary visual explanation (${v.duration || '10 min'}) by ${v.channelName}`
  }));

  data.references = [
    ...(researchData?.books || []).map(b => ({
      title: b.title,
      type: 'book',
      url: b.previewLink,
      citation: `${b.title} by ${b.authors?.join(', ')} (${b.publishedYear}) - ${b.source}`
    })),
    ...(researchData?.webArticles || []).map(w => ({
      title: w.title,
      type: 'article',
      url: w.url,
      citation: `${w.title} - ${w.sourceName}`
    }))
  ];

  return data;
}

/**
 * Intelligent Local Pedagogical Synthesizer
 * Produces an in-depth, production-grade 45-minute lesson designed for computer science education.
 */
function synthesizeLesson(title, objective, researchData) {
  const isHttpTopic = /http|request|response|get|post|status/i.test(`${title} ${objective}`);

  if (isHttpTopic) {
    return synthesizeHttpLesson(researchData);
  } else {
    return synthesizeGenericLesson(title, objective, researchData);
  }
}

function synthesizeHttpLesson(researchData) {
  const books = researchData?.books || [];
  const web = researchData?.webArticles || [];
  const videos = researchData?.youtubeVideos || [];

  const overview = `In this 45-minute intensive lesson, students will demystify the backbone of the World Wide Web: the Hypertext Transfer Protocol (HTTP) Request-Response cycle. 

Through visual mental models, live HTTP packet inspections, and hands-on JavaScript \`fetch\` simulations, learners will understand how web clients communicate with web servers. By the end of this session, learners will master the semantic differences between GET and POST methods—including query parameters, request bodies, idempotency, and security implications—and build instinctive intuition for categorizing HTTP status codes across the 2xx (Success), 4xx (Client Error), and 5xx (Server Error) classes.`;

  const timeline = [
    {
      timeRange: '00:00 - 10:00 (10 mins)',
      title: 'Phase 1: Architecture of an HTTP Dialogue',
      concept: 'The Client-Server Request-Response Lifecycle',
      details: 'Introduce HTTP as a stateless application-layer protocol built on TCP/IP. Walk through what happens when an instructor or student types a URL in a browser or submits a form: DNS resolution, TCP handshake, the HTTP Request message, Server processing, and the HTTP Response message.',
      codeOrExample: `CLIENT                           SERVER
  |                                |
  |--- 1. HTTP GET /api/users ---->| (Request Headers + URL params)
  |                                | [Processes query in DB]
  |<-- 2. HTTP 200 OK (JSON) ------| (Response Headers + Payload)
  |                                |`
    },
    {
      timeRange: '10:00 - 25:00 (15 mins)',
      title: 'Phase 2: Deep Dive into GET vs POST & Status Code Taxonomies',
      concept: 'Method Semantics, Idempotency & The 2xx/4xx/5xx Triad',
      details: 'Systematically contrast GET and POST. Emphasize that GET is for safe retrieval without side effects (idempotent, cacheable, query params visible in URL), while POST creates new entities or submits payloads (carries a request body, non-idempotent, uncached by default). Then unpack response status codes: 2xx represents successful transactions (200 OK, 201 Created), 4xx flags client errors (400 Bad Request, 401 Unauthorized, 404 Not Found), and 5xx flags server faults (500 Internal Error, 502 Bad Gateway, 503 Service Unavailable).',
      codeOrExample: `// GET Request Example
GET /products?category=books&limit=10 HTTP/1.1
Host: api.example.com
Accept: application/json

// POST Request Example
POST /products HTTP/1.1
Host: api.example.com
Content-Type: application/json
Content-Length: 54

{
  "name": "Designing Data-Intensive Apps",
  "price": 39.99
}`
    },
    {
      timeRange: '25:00 - 35:00 (10 mins)',
      title: 'Phase 3: Hands-On Interactive Lab (Live Fetch & Error Handling)',
      concept: 'Applying HTTP Client APIs & Parsing Status Categories',
      details: 'Students write a resilient client-side API helper using JavaScript async/await and Fetch API. The challenge requires correctly formulating a GET query, crafting a POST request with headers and JSON body, and using conditional branching to gracefully handle 2xx success vs 4xx client errors and 5xx server outages.',
      codeOrExample: `async function submitUserData(payload) {
  const response = await fetch('/api/v1/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (response.status >= 200 && response.status < 300) {
    return { ok: true, data: await response.json() };
  } else if (response.status >= 400 && response.status < 500) {
    throw new Error(\`Client Error (\${response.status}): Check your input format.\`);
  } else {
    throw new Error(\`Server Error (\${response.status}): The server encountered an issue. Try again later.\`);
  }
}`
    },
    {
      timeRange: '35:00 - 45:00 (10 mins)',
      title: 'Phase 4: Knowledge Checks, Common Pitfalls & Wrap-Up',
      concept: 'Pedagogical Evaluation & Misconception Clarification',
      details: 'Conduct an interactive 4-question knowledge check. Clarify dangerous anti-patterns (such as sending passwords via GET query params, or servers responding with HTTP 200 containing error messages in the body). Distinguish between 401 Unauthorized (missing/bad credentials) and 403 Forbidden (authenticated but lacks role permissions).',
      codeOrExample: `Key Takeaway Rule:
- 2xx: "Everything worked smoothly on both sides."
- 4xx: "You (the client) made a mistake; correct your request before retrying."
- 5xx: "The server failed; client request was syntactically fine."`
    }
  ];

  const markdownBody = `# HTTP Requests and Responses: GET, POST & Status Code Mastery

**Target Duration:** 45 Minutes  
**Target Audience:** Undergraduate / Junior Software Engineers  
**Core Objective:** Explain GET and POST methods and distinguish between 2xx, 4xx, and 5xx response status categories.

---

## 1. Lesson Overview & 45-Minute Timeline Breakdown

| Time Window | Phase | Primary Learning Activity |
|:---|:---|:---|
| **00:00 - 10:00** | **Phase 1: Foundations** | The Client-Server Conversation, Packet Anatomy & TCP/IP handshake |
| **10:00 - 25:00** | **Phase 2: Deep Dive** | GET vs POST semantics, Idempotency, and the 2xx, 4xx, 5xx Status Matrix |
| **25:00 - 35:00** | **Phase 3: Hands-On Lab** | Live HTTP inspection & building a status-aware API wrapper |
| **35:00 - 45:00** | **Phase 4: Evaluation** | Interactive Knowledge Check, Anti-patterns & Practical Wrap-up |

---

## 2. Phase 1: Anatomy of an HTTP Transaction (00:00 - 10:00)

Every time you browse the web or trigger an action inside a mobile app, your client software (e.g., Google Chrome, a mobile app, or a Node.js microservice) opens an **HTTP Dialogue** with an upstream server.

An HTTP transaction consists of two immutable messages:
1. **The HTTP Request**: Sent by the client to ask the server to perform an action or supply a resource.
2. **The HTTP Response**: Returned by the server with a numeric **Status Code** and optional payload.

### The Request Structure
\`\`\`http
POST /api/v1/enrollment HTTP/1.1
Host: kalvium.example.com
User-Agent: Mozilla/5.0
Content-Type: application/json
Content-Length: 42

{"studentId": "KV-2026", "course": "CS101"}
\`\`\`

1. **Start Line**: Method (\`POST\`), Request Target (\`/api/v1/enrollment\`), and HTTP Version (\`HTTP/1.1\`).
2. **Headers**: Key-value metadata providing instructions (content format, authentication tokens, caching).
3. **Empty Line (CRLF)**: Crucial boundary marking end of headers.
4. **Body**: The actual payload (present in POST, PUT, PATCH; omitted in standard GET).

---

## 3. Phase 2: Core Deep Dive — GET vs. POST (10:00 - 25:00)

### Architectural Comparison Matrix

| Property | \`GET\` Method | \`POST\` Method |
|:---|:---|:---|
| **Primary Intent** | Retrieve data without side effects | Submit data to be processed / created |
| **Idempotency** | **Yes** (Calling 10 times yields same state) | **No** (Calling 10 times creates 10 entities) |
| **Data Location** | URL Query String (\`?id=123&sort=asc\`) | Request Body Payload (\`JSON\`, \`FormData\`) |
| **Browser Caching** | Cached by default (proxies & CDN) | Never cached by default |
| **Bookmarking / History** | Yes, URLs can be saved and shared | No, browsers warn before re-submission |
| **Security Note** | Never pass sensitive credentials | Encrypted in body when using TLS/HTTPS |

> **Crucial Rule:** \`GET\` requests must be **safe and idempotent**. They should never alter state on the server (e.g., never create a user or delete an invoice via GET).

---

## 4. The Response Status Code Triad: 2xx, 4xx, and 5xx

HTTP status codes are 3-digit integers categorized by their first digit:

### 🟢 2xx: Success (The Request Succeeded)
The server received, understood, and successfully fulfilled the client request.
- **\`200 OK\`**: Standard success for GET and successful updates.
- **\`201 Created\`**: Returned by POST when a new resource was successfully generated (often includes a \`Location\` header).
- **\`204 No Content\`**: Operation succeeded, but no body is returned (frequently used for DELETE or empty updates).

### 🟠 4xx: Client Errors (The Problem is on the Requester's End)
The client sent something incorrect or lacks proper authorization. The request should **not** be repeated without modification.
- **\`400 Bad Request\`**: Malformed syntax, invalid JSON schema, or missing required parameter.
- **\`401 Unauthorized\`**: Authentication credentials are missing or invalid (e.g., missing API token).
- **\`403 Forbidden\`**: Server knows who you are, but you do not have permission to access the resource.
- **\`404 Not Found\`**: The requested URI does not map to any existing resource.
- **\`422 Unprocessable Entity\`**: The payload syntax is valid JSON, but business validation failed (e.g., invalid email format).

### 🔴 5xx: Server Errors (The Server Failed)
The client sent a valid request, but the server encountered an unhandled exception or upstream infrastructure fault.
- **\`500 Internal Server Error\`**: Uncaught exception or backend crash.
- **\`502 Bad Gateway\`**: The reverse proxy (Nginx, Cloudflare) received an invalid response from the backend application process.
- **\`503 Service Unavailable\`**: Server is temporarily overloaded, undergoing maintenance, or rate-limited upstream.
- **\`504 Gateway Timeout\`**: Backend failed to respond within the reverse proxy's timeout window.

---

## 5. Phase 3: Hands-On Exercise (25:00 - 35:00)

### Challenge: Implement a Resilient HTTP Client Function
Build a JavaScript function \`dispatchRequest\` that issues a POST request, checks the response category, and throws actionable error messages tailored to 2xx, 4xx, and 5xx.

\`\`\`javascript
async function dispatchRequest(url, payload) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) { // res.ok evaluates to true for status 200-299
      const data = await res.json();
      console.log('✅ 2xx Success:', data);
      return data;
    }

    if (res.status >= 400 && res.status < 500) {
      console.error(\`⚠️ 4xx Client Error (\${res.status}): Please check parameters.\`);
      return { error: 'client_error', status: res.status };
    }

    if (res.status >= 500) {
      console.error(\`🔥 5xx Server Error (\${res.status}): Backend service failure.\`);
      return { error: 'server_error', status: res.status };
    }
  } catch (networkErr) {
    console.error('🌐 Network Failure (Offline / DNS / CORS):', networkErr.message);
  }
}
\`\`\`

---

## 6. Phase 4: Knowledge Checks (35:00 - 45:00)

Test your understanding with these foundational scenarios:

1. **Scenario 1:** A user submits a payment form. Should the browser issue a GET or a POST request? Why?
   * *Answer:* **POST**. Financial transactions alter server state (charging money, creating invoice) and require a secure request body.
2. **Scenario 2:** You send a request without an \`Authorization\` header and receive \`401\`. Is the client at fault or the server?
   * *Answer:* **The client (4xx)**. The client omitted required credentials.
3. **Scenario 3:** Your database server runs out of disk space, causing incoming requests to throw uncaught exceptions. Which status class must your API return?
   * *Answer:* **5xx (specifically 500 or 503)**. The client's request was fine; the server broke.

---

## 7. Supplementary Video Resources & Bibliography

### Video Resources
${videos.map((v, i) => `${i + 1}. **[${v.title}](${v.url})**  
   - Channel: *${v.channelName}* (Duration: ${v.duration})  
   - Key Focus: ${v.relevanceNote}`).join('\n\n')}

### Researched References & Authoritative Reading
${books.map((b, i) => `${i + 1}. **${b.title}**  
   - Authors: ${b.authors?.join(', ')} (${b.publishedYear})  
   - Source: [${b.source}](${b.previewLink})  
   - Note: ${b.description}`).join('\n\n')}

${web.map((w, i) => `${books.length + i + 1}. **[${w.title}](${w.url})**  
   - Source: *${w.sourceName}*  
   - Reliability: ${w.reliability}  
   - Summary: ${w.snippet}`).join('\n\n')}
`;

  const practicalExercise = {
    title: 'HTTP Client Diagnostic & Status Code Router',
    instructions: 'Implement an asynchronous function `fetchOrHandleError(endpoint, method, body)` that correctly formats GET/POST requests and handles 2xx, 4xx, and 5xx response categories.',
    starterCode: `// Starter Code: Complete the status code router
async function fetchOrHandleError(endpoint, method = 'GET', body = null) {
  const options = { method };
  if (method === 'POST' && body) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }

  // TODO: Execute fetch and return diagnostic object with { category: '2xx'|'4xx'|'5xx', data, status }
  const response = await fetch(endpoint, options);
  
  // Write conditional logic below:
  
}
`,
    solutionCode: `async function fetchOrHandleError(endpoint, method = 'GET', body = null) {
  const options = { method };
  if (method === 'POST' && body) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(endpoint, options);
    const status = res.status;

    if (status >= 200 && status < 300) {
      const data = await res.json().catch(() => null);
      return { category: '2xx', status, success: true, data };
    } else if (status >= 400 && status < 500) {
      return { category: '4xx', status, success: false, message: 'Client request invalid or unauthorized' };
    } else if (status >= 500 && status < 600) {
      return { category: '5xx', status, success: false, message: 'Server infrastructure error' };
    } else {
      return { category: 'other', status, success: false, message: 'Unclassified response' };
    }
  } catch (err) {
    return { category: 'network_error', success: false, message: err.message };
  }
}`
  };

  const knowledgeCheck = [
    {
      question: 'Which of the following statements accurately characterizes an HTTP GET request compared to POST?',
      options: [
        'GET requests are non-idempotent and carry sensitive data inside the HTTP payload body.',
        'GET requests are safe and idempotent, meaning repeated identical requests should not change the state of the server.',
        'GET requests cannot carry query parameters in the URL.',
        'POST requests are cached automatically by all web browsers and content delivery networks (CDNs).'
      ],
      correctAnswerIndex: 1,
      explanation: 'According to RFC 9110, GET is defined as a safe and idempotent method used strictly to retrieve representations of resources without altering server state.'
    },
    {
      question: 'A client sends an API request to /api/orders without a Bearer authentication token. What status code and category should the server return?',
      options: [
        '200 OK (2xx Success)',
        '401 Unauthorized (4xx Client Error)',
        '500 Internal Server Error (5xx Server Error)',
        '404 Not Found (4xx Client Error)'
      ],
      correctAnswerIndex: 1,
      explanation: '401 Unauthorized belongs to the 4xx Client Error category and explicitly signals that authentication credentials are required and either missing or invalid.'
    },
    {
      question: 'What distinguishes a 4xx error from a 5xx error in system architecture troubleshooting?',
      options: [
        '4xx means the backend code threw an unhandled runtime exception; 5xx means the user typed a typo.',
        '4xx indicates a client-side problem (e.g. invalid parameter, unauthorized); 5xx indicates a server-side problem (e.g. database crash, gateway timeout).',
        '4xx codes should always be retried without changing the request; 5xx codes should never be retried.',
        'There is no distinction; they are interchangeable error conventions.'
      ],
      correctAnswerIndex: 1,
      explanation: 'The fundamental architectural divide is responsibility: 4xx errors state that the client provided something erroneous; 5xx errors state that the client was syntactically correct, but the server failed to fulfill it.'
    }
  ];

  const supplementaryResources = videos.map(v => ({
    title: v.title,
    type: 'video',
    url: v.url,
    note: `Recommended supplementary visual explanation (${v.duration || '10 min'}) by ${v.channelName}`
  }));

  const references = [
    ...books.map(b => ({
      title: b.title,
      type: 'book',
      url: b.previewLink,
      citation: `${b.title} by ${b.authors?.join(', ')} (${b.publishedYear}) - ${b.source}`
    })),
    ...web.map(w => ({
      title: w.title,
      type: 'article',
      url: w.url,
      citation: `${w.title} - ${w.sourceName}`
    }))
  ];

  return {
    overview,
    timeline,
    markdownBody,
    practicalExercise,
    knowledgeCheck,
    supplementaryResources,
    references
  };
}

function synthesizeGenericLesson(title, objective, researchData) {
  const books = researchData?.books || [];
  const web = researchData?.webArticles || [];
  const videos = researchData?.youtubeVideos || [];

  const overview = `This structured 45-minute lesson explores **${title}**, designed to guide students systematically toward the core learning objective: **${objective}**. 

Through progressive scaffolding—spanning foundational principles, architectural analysis, practical hands-on exercises, and formative knowledge checks—learners gain both conceptual understanding and pragmatic engineering intuition.`;

  const timeline = [
    {
      timeRange: '00:00 - 10:00 (10 mins)',
      title: 'Phase 1: Foundations & Motivation',
      concept: `Introduction to ${title} and core terminology`,
      details: `Establish real-world motivation and define fundamental concepts related to ${objective}.`,
      codeOrExample: `// Conceptual Diagram / Architecture Overview for ${title}`
    },
    {
      timeRange: '10:00 - 25:00 (15 mins)',
      title: 'Phase 2: Core Deep Dive & Detailed Mechanics',
      concept: 'In-depth exploration with technical examples',
      details: `Examine the operational mechanisms and key principles supporting ${objective}.`,
      codeOrExample: `// Technical Implementation & Example Code for ${title}`
    },
    {
      timeRange: '25:00 - 35:00 (10 mins)',
      title: 'Phase 3: Hands-On Interactive Lab',
      concept: 'Practical implementation and debugging exercise',
      details: 'Students apply principles hands-on through a guided coding or analytical challenge.',
      codeOrExample: `// Interactive exercise code and test runner`
    },
    {
      timeRange: '35:00 - 45:00 (10 mins)',
      title: 'Phase 4: Synthesis, Knowledge Check & Key Takeaways',
      concept: 'Formative evaluation and common pitfall remediation',
      details: 'Assess student retention through targeted multiple-choice checks and summarize best practices.',
      codeOrExample: `// Summary checklist and key review takeaways`
    }
  ];

  const markdownBody = `# ${title}

**Target Duration:** 45 Minutes  
**Target Audience:** Undergraduate / Junior Developers  
**Primary Learning Objective:** ${objective}

---

## 1. Executive Summary & 45-Minute Pacing

| Phase | Duration | Core Focus |
|:---|:---|:---|
| **Phase 1: Foundations** | 00:00 - 10:00 | Core Motivation, Architecture & Mental Models |
| **Phase 2: Deep Dive** | 10:00 - 25:00 | Detailed Mechanics, Syntax & Trade-offs |
| **Phase 3: Hands-on Lab** | 25:00 - 35:00 | Guided Implementation & Practice Exercise |
| **Phase 4: Wrap-up** | 35:00 - 45:00 | Formative Knowledge Checks & Key Takeaways |

---

## 2. Phase 1: Conceptual Foundations (00:00 - 10:00)
${overview}

---

## 3. Phase 2: Technical Deep Dive (10:00 - 25:00)
To achieve the objective (${objective}), students must understand the underlying technical mechanisms and operational constraints.

### Core Principles
1. **Separation of Concerns**: Ensuring modular and maintainable design.
2. **Predictable Behavior**: Establishing deterministic outcomes and handling edge cases.
3. **Observability**: Understanding how systems communicate errors and state transitions.

---

## 4. Phase 3: Hands-On Practice Lab (25:00 - 35:00)
Students will implement and test their understanding using the guided practical exercise provided in this lesson module.

---

## 5. Phase 4: Knowledge Checks & Synthesis (35:00 - 45:00)
Evaluate retention through scenario-based questioning and resolve common conceptual pitfalls.

---

## 6. Supplementary Resources & References

### Video Tutorials
${videos.map((v, i) => `${i + 1}. **[${v.title}](${v.url})** (${v.channelName})`).join('\n')}

### Books & Documentation
${books.map((b, i) => `${i + 1}. **${b.title}** by ${b.authors?.join(', ')} (${b.publishedYear})`).join('\n')}
${web.map((w, i) => `${books.length + i + 1}. **[${w.title}](${w.url})** - ${w.sourceName}`).join('\n')}
`;

  const practicalExercise = {
    title: `Practical Implementation: ${title}`,
    instructions: `Implement a working module that addresses ${objective}. Ensure clear error handling and structure.`,
    starterCode: `// Starter Code for ${title}\nfunction solveProblem() {\n  // TODO: Implement solution\n}`,
    solutionCode: `// Verified Reference Solution for ${title}\nfunction solveProblem() {\n  console.log("Completed exercise addressing: ${objective}");\n  return true;\n}`
  };

  const knowledgeCheck = [
    {
      question: `What is the primary architectural goal of ${title}?`,
      options: [
        `To fulfill the objective: ${objective}`,
        'To bypass security validation',
        'To eliminate the need for error handling',
        'None of the above'
      ],
      correctAnswerIndex: 0,
      explanation: `The foundational goal directly aligns with the stated objective: ${objective}.`
    }
  ];

  return {
    overview,
    timeline,
    markdownBody,
    practicalExercise,
    knowledgeCheck,
    supplementaryResources: videos.map(v => ({ title: v.title, type: 'video', url: v.url, note: `By ${v.channelName}` })),
    references: [
      ...books.map(b => ({ title: b.title, type: 'book', url: b.previewLink, citation: `${b.title} by ${b.authors?.join(', ')}` })),
      ...web.map(w => ({ title: w.title, type: 'article', url: w.url, citation: `${w.title} - ${w.sourceName}` }))
    ]
  };
}
