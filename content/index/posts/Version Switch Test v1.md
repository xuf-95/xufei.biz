---
title: "Version Switch Test"
date: 2026-06-03
tags:
  - quartz
  - test
publish: true
description: Test page for the article version switcher.
versions:
  - label: "v1.0"
    path: "index/Posts/Version-Switch-Test-v1"
    current: true
  - label: "v2.0"
    path: "index/Posts/Version-Switch-Test-v2"
---

This is the first version of the version switcher test page.

Expected behavior:

- The version switcher appears below the article title.
- `v1.0` is highlighted as the current version.
- `v2.0` links to the second version of this test page.

## Test Notes

Use this page to verify the component renders when at least two valid versions are declared in frontmatter.
