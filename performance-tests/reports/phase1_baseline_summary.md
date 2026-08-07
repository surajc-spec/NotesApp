# 📊 Phase 1 Baseline Performance Benchmark Report (No Cache)

**Target API**: `GET /api/notes/view-notes`  
**Environment**: MERN Stack (Node.js + Express + MongoDB Atlas)  
**Caching Status**: No Caching (Direct DB Queries)  
**Virtual Users**: 20 Concurrent VUs  
**Test Duration**: 50 Seconds  

---

## 📈 Executive Summary

Under a moderate load of **20 concurrent Virtual Users**, NoteShare experienced significant performance degradation and rate-limit drops without caching:

- **25.77% of requests failed** (174 out of 675 requests dropped due to rate-limiting / connection throttling).
- **P95 Latency was 314.75 ms**, breaching our target SLA of `< 300 ms`.
- **Peak Tail Latency hit 5.3 seconds (5,300 ms)**, causing severe site freezes for tail users.

---

## 📊 Detailed Baseline Metrics Table

| Performance Metric | Measured Baseline Value | Target SLA Budget | Status |
| :--- | :--- | :--- | :--- |
| **Total Requests Completed** | `675` | N/A | Completed |
| **Throughput (RPS)** | `13.2 req/sec` | `> 25 req/sec` | ⚠️ Low |
| **Average Response Time** | `132.00 ms` | `< 150 ms` | ✅ Pass |
| **P50 Latency (Median)** | `39.61 ms` | `< 100 ms` | ✅ Pass |
| **P90 Latency** | `139.99 ms` | `< 200 ms` | ✅ Pass |
| **P95 Latency** | **`314.75 ms`** | `< 300 ms` | ❌ SLA Failed |
| **Max Response Time (Peak)** | **`5,300.00 ms` (5.3s)** | `< 1,000 ms` | ❌ Severe Spike |
| **HTTP Error / Failure Rate** | **`25.77%`** (174 drops) | `< 1.0%` | ❌ Critical Fail |

---

## 🔍 Bottleneck Analysis

1. **Rate Limiter Throttling (`apiLimiter`)**:
   - `rateLimitMiddleware.apiLimiter` blocked 174 requests with `HTTP 429 Too Many Requests` because 20 VUs hit the endpoint simultaneously without cache.
2. **MongoDB Connection Queueing**:
   - Uncached requests query MongoDB Atlas for every single page render. Under 20 VUs, MongoDB connection pool requests queue up, causing latency spikes to **5,300 ms**.
