# Security Policy

## Reporting a Vulnerability

SEOScope is a free, open-source tool with no authentication or user data storage. If you discover a security issue, please open a [GitHub Issue](https://github.com/QaziNafay/seoscope/issues) with the label `security`.

We aim to acknowledge reports within 48 hours and address critical issues within 7 days.

## Scope

The following are in scope:

- Server-side request forgery (SSRF) via the URL analysis endpoint
- Cross-site scripting (XSS) in the displayed analysis results
- Remote code execution (RCE) in serverless function
- Denial of service (DoS) via the API

## Out of Scope

- Missing HTTPS on target URLs (we analyze what is provided)
- Content issues on analyzed third-party pages
- Rate-limiting bypass (rate limiting is a courtesy, not a guarantee)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Measures

This project implements:

1. **URL validation** — only valid HTTP/HTTPS URLs are accepted
2. **Request timeout** — all outbound requests abort after 15 seconds
3. **No persistence** — analysis data is served in the response and immediately garbage-collected
4. **Content Security Policy** — strict CSP headers on all responses
5. **Rate limiting** — basic in-memory throttling on the API route
