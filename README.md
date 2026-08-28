# Gemini LifeOS — Private Authenticated AI Intelligence Workspace

Gemini LifeOS evolved from the Personal Gemini Journal concept into a private, authenticated personal AI intelligence workspace. Built for individuals looking to turn open-ended thinking into structured execution, the platform enables authenticated users to engage in multi-turn dialogues with Google Gemini, dynamically ground discussions in approved personal context, and extract structured knowledge—including durable memories, strategic goals, and concrete action items.

Crucially, Gemini LifeOS enforces a strict human-in-the-loop security paradigm: AI-generated records are never written directly to the database without explicit user inspection and approval.

---

## Architecture Overview

Gemini LifeOS follows a full-stack architecture that strictly isolates client-side presentation from privileged server-side operations and AI credentials.

```text
Browser Client (React 19 + TypeScript + Tailwind CSS)
   │
   ├── [Firebase Authentication] (Google Sign-In)
   ├── [Cloud Firestore Client] (/users/{userId}/* secured via Security Rules)
   │
   └── Authenticated API Requests (Bearer <Firebase ID Token>)
          │
          ▼
   Express / Node.js Backend Server
          │
          ├── Firebase Admin SDK (Cryptographic Token Verification & UID derivation)
          ├── Input Validation & Prompt Injection Defenses
          └── Google Gemini API (@google/genai SDK, server-side process.env.GEMINI_API_KEY)
```

* **Client Layer**: Single-page application built with React and TypeScript. Authenticates users using Firebase Authentication (Google Sign-In) and interacts with Cloud Firestore for real-time reads and writes within the user's isolated subcollections.
* **Serverless / Backend Layer**: Express on Node.js. All protected endpoints verify the incoming Firebase ID token using the Firebase Admin SDK and derive the authenticated UID server-side.
* **AI Integration**: The backend communicates directly with the Google Gemini API (`@google/genai`). The Gemini API key is managed securely on the server and is never exposed to the client browser.

---

## Technology Stack

* **Frontend Framework & UI**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion, Canvas-Confetti, React-Markdown
* **Backend Runtime & Server**: Node.js, Express, TypeScript (`tsx` in development, `esbuild` for production bundling)
* **Authentication**: Firebase Authentication with Google Sign-In provider
* **Backend Token Verification**: Firebase Admin SDK (`verifyIdToken`)
* **Database & Persistence**: Cloud Firestore (strict owner-bound security paths)
* **AI Model & SDK**: Google Gemini API via the official `@google/genai` TypeScript SDK
* **Production Deployment**: Google Cloud Run
* **Secret Management**: Google Cloud Secret Manager

---

## Firestore Hierarchy & Security Rules

All user-generated records, conversations, memories, goals, actions, and insights are partitioned under the user's unique Firebase Authentication identifier (`userId`).

### Collection Hierarchy

```text
/users/{userId}
/users/{userId}/conversations/{conversationId}
/users/{userId}/conversations/{conversationId}/messages/{messageId}
/users/{userId}/memories/{memoryId}
/users/{userId}/goals/{goalId}
/users/{userId}/actions/{actionId}
/users/{userId}/insights/{insightId}
```

### Firestore Security Rules (`firestore.rules`)

Access control is strictly bound to the authenticated user's ID (`request.auth.uid == userId`). This rule guarantees that an authenticated user can only read, create, update, or delete records within their own `/users/{userId}` path, completely preventing cross-user data exposure.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);

      match /conversations/{conversationId} {
        allow read, write: if isOwner(userId);

        match /messages/{messageId} {
          allow read, write: if isOwner(userId);
        }
      }

      match /memories/{memoryId} {
        allow read, write: if isOwner(userId);
      }

      match /goals/{goalId} {
        allow read, write: if isOwner(userId);
      }

      match /actions/{actionId} {
        allow read, write: if isOwner(userId);
      }

      match /insights/{insightId} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

---

## Security Model & Threat Mitigation

Gemini LifeOS applies defense-in-depth principles across all interaction layers:

1. **Cryptographic Token Verification**: Protected endpoints require a valid Firebase ID token in the `Authorization: Bearer <token>` header. The Firebase Admin SDK verifies token integrity and expiration.
2. **Server-Derived Identity**: The user's UID is derived strictly from the verified authentication token (`decodedToken.uid`). Client-supplied user IDs in request bodies or query parameters are never trusted.
3. **Database Owner Isolation**: Firestore security rules restrict all document access to `request.auth.uid == userId`, preventing insecure direct object reference (IDOR) attacks at the database layer.
4. **Input Validation & Sanitization**: Incoming request payloads are validated for structure, length, and allowed enum values before processing.
5. **Prompt Injection Defense**: Stored personal memories, goals, and actions retrieved for context grounding are treated as untrusted data blocks and isolated from core system prompts.
6. **Structured Output Enforcement**: Knowledge extraction uses explicit JSON schemas (`responseSchema`) with constrained enum values to prevent arbitrary output generation.
7. **Human-in-the-Loop Persistence**: The AI model is strictly prohibited from writing directly to the database. Extracted items are presented in a review interface where the user must approve, edit, or dismiss them before persistence.
8. **Credential Protection**: The Gemini API key and Firebase credentials remain exclusively on the server, loaded via environment variables and Google Cloud Secret Manager.

---

## Unique Features

* **Human-in-the-Loop Knowledge Extraction**: Rather than silently updating user profiles, Gemini analyzes conversations and proposes candidate memories, goals, and actions. Users review, modify, or discard each item before it is committed to Firestore.
* **Context-Aware AI Workspace**: Users can toggle personal context grounding on or off per conversation, allowing Gemini to reference approved memories, goals, and actions without manual prompting.
* **Discrete Knowledge Taxonomies**: Clearly separates durable context (**Memories**), target milestones (**Goals**), immediate tasks (**Actions**), and strategic observations (**Insights**).
* **Goal-to-Action Linkage**: Concrete actions can be linked directly to strategic parent goals, maintaining a clear line of sight between daily tasks and long-term objectives.
* **Synthesized Strategic Insights**: An on-demand AI analysis engine identifies patterns, progress blockers, and strategic recommendations across approved personal data.
* **Interactive Security Audit View**: A built-in diagnostic dashboard allows users to inspect active token status, verify Firestore security boundaries, and validate that API credentials remain hidden.

---

## Application Features

* **Dashboard**: Unified overview displaying activity summaries, active goals, pending tasks, recent conversations, and high-priority AI insights.
* **AI Workspace**: Multi-turn chat interface supporting Markdown formatting, real-time message streaming, automatic scroll management, and context toggle controls.
* **Extraction Review Modal**: Interactive staging area for reviewing and editing AI-extracted memories, goals, and actions before saving to Firestore.
* **Memories Manager**: Filterable repository for durable personal knowledge categorized across work, education, projects, ideas, preferences, and personal life.
* **Goals Manager**: Strategic goal tracker with status categorization (active, completed, archived), target deadlines, and progress indicators.
* **Actions Manager**: Execution checklist featuring priority filters, goal associations, status toggles, and celebratory visual feedback upon completion.
* **Insights Hub**: AI-powered synthesis view generating structured patterns, milestone progress reviews, and actionable recommendations.
* **Conversation History**: Searchable archive of past dialogues with the ability to inspect historical exchanges.
* **Security Audit Dashboard**: Live inspector for reviewing token claims, Firestore path isolation, and architecture security controls.

---

## Google Cloud Run Deployment

For production deployment on Google Cloud Run, credentials are provided via Google Cloud Secret Manager and bound as environment variables.

### 1. Configure Google Cloud Secret Manager

```bash
# 1. Create the secret for the Gemini API key
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
  --data-file=- \
  --replication-policy="automatic"

# 2. Grant Secret Accessor permissions to the Cloud Run service account
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 2. Deploy Container to Cloud Run

Deploy the container image with the required challenge label and secret binding:

```bash
gcloud run deploy gemini-lifeos \
  --image gcr.io/PROJECT_ID/gemini-lifeos \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
  --labels="dev-tutorial=cloud-run-ai-challenge"
```

> **Verification Tag**: `dev-tutorial=cloud-run-ai-challenge`

---

## Vercel Testing

During iterative development, Vercel was used as a preview and testing environment to validate frontend layout responsiveness, user authentication flows, and serverless API route compatibility before finalizing container packaging for Cloud Run.

---

## Testing & Verification

The following scenarios were verified across development and preview environments:

* **Authentication**: Google Sign-In popup flow, token issuance, session persistence across page refreshes, and clean logout.
* **Backend Authorization**: Verification of Firebase ID tokens using the Firebase Admin SDK; rejection of missing or malformed tokens.
* **Conversational AI**: Multi-turn dialogue with Gemini, contextual memory grounding, and Markdown rendering of responses.
* **Knowledge Extraction**: Structured extraction of memories, goals, and actions followed by manual user approval and rejection testing.
* **Database Isolation**: Verification that users can only read and write documents matching their authenticated UID (`/users/{userId}/*`).
* **Cross-Device UI**: Verified full viewport containment (100dvh) and internal chat scrolling behavior on desktop and mobile viewports.
* **API Health**: Verification of `/api/health` endpoint reporting operational status.
* **Credential Isolation**: Inspection confirming the Gemini API key is never transmitted to or accessible from browser developer tools.

---

## Google Cloud Run AI Challenge Requirements

| Requirement | Implementation in Gemini LifeOS |
| :--- | :--- |
| **Firebase Authentication** | Google Sign-In client integration with server-side ID token verification via Firebase Admin SDK. |
| **Google Gemini API** | Server-side integration using the official `@google/genai` SDK for dialogues, structured extraction, and insight synthesis. |
| **Cloud Firestore** | Durable, owner-isolated personal database structured under `/users/{userId}/*` enforced by security rules. |
| **Secret Manager** | Secure storage and runtime injection of `GEMINI_API_KEY` into Cloud Run without exposing secrets. |
| **Google Cloud Run** | Containerized deployment target labeled with `dev-tutorial=cloud-run-ai-challenge`. |
| **Security Directives** | Security-first development directives applied throughout: prompt injection defenses, token verification, and human approval for AI data. |

---

## Deployment & Repository Links

* **Live Demo (Cloud Run)**: `[Cloud Run Deployment URL]` *(Deploying to Cloud Run with tag `dev-tutorial=cloud-run-ai-challenge`)*
* **Development Preview**: `https://ais-dev-yhnjobqxambdfy2w2sr2qo-755446549071.asia-east1.run.app`
* **GitHub Repository**: `[GitHub Repository URL]`
