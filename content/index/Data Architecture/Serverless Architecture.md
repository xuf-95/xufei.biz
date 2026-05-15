---
date: 2024-01-09
aliases:
tags:
  - bigdata
  - data-architecture
  - cloud
  - data-server
description:
draft: false
publishDate: 2025-09-26T16:58
---
## Serverless Architecture

Serverless architecture is a cloud computing model where developers build and run applications **without managing servers**. Despite the name, servers still exist — but the cloud provider handles all infrastructure provisioning, scaling, and maintenance automatically.

### Core Idea

You write functions or services, deploy them, and only pay for the compute time actually used. The cloud provider spins up resources on demand and scales them automatically.

### How It Works

1. **Event triggers** a function (HTTP request, database change, file upload, timer, etc.)
2. **Cloud provider spins up** the required compute resources instantly
3. **Function executes** and returns a result
4. **Resources are released** — you're billed only for that execution time

### Key Characteristics

**Function as a Service (FaaS)** — Code is broken into small, single-purpose functions (e.g., AWS Lambda, Google Cloud Functions, Azure Functions).

**No server management** — No provisioning, patching, or capacity planning needed.

**Auto-scaling** — Scales from zero to millions of requests automatically.

**Pay-per-use** — Billed per invocation and execution duration, not idle time.

**Stateless** — Each function execution is independent; state is stored externally (databases, caches).

### Popular Providers

| Provider         | Service                         |
| ---------------- | ------------------------------- |
| AWS              | [[Lambda Architecture\|Lambda]] |
| Google Cloud     | Cloud Functions / Cloud Run     |
| Microsoft Azure  | Azure Functions                 |
| Vercel / Netlify | Edge Functions                  |
| Cloudflare       | Workers                         |

### Pros & Cons

**Advantages:**

- Reduced operational overhead
- Automatic scaling (including to zero)
- Lower costs for variable/unpredictable workloads
- Faster time to market

**Disadvantages:**

- **Cold starts** — slight latency when a function hasn't run recently
- **Vendor lock-in** — tightly coupled to a cloud provider's ecosystem
- **Limited execution time** — functions often have max timeouts (e.g., 15 min on Lambda)
- **Harder to debug** — distributed nature makes tracing complex
- **Not ideal for long-running tasks**

### Common Use Cases

- REST APIs and microservices
- Real-time file/image processing
- Scheduled jobs (cron tasks)
- Event-driven data pipelines
- Chat bots and webhooks
- IoT backend processing

### Serverless vs. Traditional

||Traditional|Serverless|
|---|---|---|
|Server management|You handle it|Provider handles it|
|Scaling|Manual/configured|Automatic|
|Billing|Always-on|Per execution|
|Deployment unit|App/container|Function|

In short, serverless lets you **focus purely on code and business logic**, offloading all infrastructure concerns to the cloud provider.

