# Gemini LifeOS — Private Authenticated AI Intelligence Workspace

Gemini LifeOS is a production-grade private AI workspace where authenticated users engage in multi-turn strategic dialogues with Gemini and turn conversations into user-controlled personal knowledge (memories, strategic goals, execution actions, and synthesized insights).

---

## 1. Architecture Overview

```text
Browser Client (React 19 + Tailwind CSS)
   │
   ├── [Firebase Authentication] (Google Sign-In)
   ├── [Cloud Firestore Client] (/users/{uid}/* locked via Security Rules)
   │
   └── Authenticated API Requests (Bearer <Firebase ID Token>)
          │
          ▼
   Cloud Run / Express Backend Server
          │
          ├── Firebase Admin SDK (Cryptographic Token Verification & UID derivation)
          ├── Prompt Injection Defenses & Schema Validation
          └── Gemini 3.6 Flash API (@google/genai SDK, process.env.GEMINI_API_KEY)
```

---

## 2. Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion, Canvas-Confetti
* **Backend**: Node.js, Express, TypeScript (`tsx` / `esbuild`)
* **Identity & Authentication**: Firebase Authentication (Google Sign-In) + Firebase Admin SDK
* **Database & Persistence**: Cloud Firestore (Strict Owner Isolation: `/users/{userId}/*`)
* **AI Engine**: Google Gemini 3.6 Flash (`@google/genai`)
* **Deployment**: Google Cloud Run (`dev-tutorial=cloud-run-ai-challenge`)

---

## 3. Data Hierarchy & Firestore Security Rules

All personal records are scoped strictly to the authenticated Firebase UID:

```text
/users/{userId}
/users/{userId}/conversations/{conversationId}
/users/{userId}/conversations/{conversationId}/messages/{messageId}
/users/{userId}/memories/{memoryId}
/users/{userId}/goals/{goalId}
/users/{userId}/actions/{actionId}
/users/{userId}/insights/{insightId}
```

### Firestore Security Rules (`firestore.rules`):

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

## 4. Threat Modeling Summary Matrix

| Threat Zone | Identified Threat | Impact | Implemented Mitigation |
| :--- | :--- | :--- | :--- |
| **1. Input Surfaces** | Malformed payloads, oversized inputs, prompt injection | High | Strict input schemas, type and length validation, category/status enum restrictions. |
| **2. Planning & Reasoning** | Indirect prompt injection via stored personal context | Critical | Personal memories/goals isolated as untrusted data blocks; structured JSON schema output validation (`responseSchema`). |
| **3. Tool & Backend** | IDOR, unauthorized privilege escalation | Critical | All protected endpoints verify Firebase ID token with Firebase Admin SDK; UID derived strictly from verified token. |
| **4. Memory & State** | Cross-user data leakage and unauthorized persistence | Critical | Subcollections locked per-UID; mandatory user review & approval modal before any AI extraction is persisted. |
| **5. Inter-System** | Exposure of `GEMINI_API_KEY` to browser or Git | Critical | Gemini credentials remain exclusively server-side. Zero client-side API key leakage. |

---

## 5. Application Sections & Capabilities

1. **Dashboard**: High-level overview of approved memories, active goals, pending actions, recent conversations, and latest AI insights.
2. **AI Workspace**: Multi-turn dialogue with Gemini, contextual memory grounding toggle, and automatic structured knowledge extraction.
3. **Knowledge Extraction Review**: User-controlled approval modal allowing inspection, inline editing, and selective commitment of candidate memories, goals, and actions to Cloud Firestore.
4. **Memories**: Durable categorized context (personal, work, education, project, idea, preference, other) with search and full CRUD.
5. **Goals**: Milestone manager with statuses (active, completed, archived) and deadline tracking.
6. **Actions**: Execution task list linked to strategic goals with completion toggles and celebratory feedback.
7. **Insights**: On-demand synthesis engine generating pattern analyses, progress summaries, and strategic recommendations grounded on approved personal data.
8. **History**: Browsable conversation archive with ability to inspect past messages and resume sessions.
9. **Security Audit**: Live security verification inspector verifying token validation, Firestore boundaries, and zero secret leakage.

---

## 6. Cloud Run Deployment & Secret Manager Configuration

### 6.1 Create Secret in Google Cloud Secret Manager

```bash
# 1. Create the secret in Secret Manager
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
  --data-file=- \
  --replication-policy="automatic"

# 2. Grant Secret Accessor role to the Cloud Run runtime service account
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 6.2 Deploy to Cloud Run with Secret Binding

Deploy with the required Google Cloud Run AI Challenge label and Secret Manager binding:

```bash
gcloud run deploy gemini-lifeos \
  --image gcr.io/PROJECT_ID/gemini-lifeos \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
  --labels="dev-tutorial=cloud-run-ai-challenge"
```

Deployment Challenge Verification Tag: `dev-tutorial=cloud-run-ai-challenge`
