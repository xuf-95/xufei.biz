---
title: Streaming Processing
tags:
  - flink
  - real-time
date: 2022-01-25
draft: false
publish: true
language: EN
---

including the `StreamTask` execution model, task lifecycle management, checkpointing integration, and input/output processing mechanisms. This is the foundational layer that executes streaming operators and manages their state and fault tolerance.

## Core Architecture Overview

Flink's streaming processing is built around the `StreamTask` abstraction, which serves as the execution container for stream operators. The architecture follows a layered approach where streaming tasks execute within the broader Flink runtime task management system.