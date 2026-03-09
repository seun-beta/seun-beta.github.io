---
title: "When Your Observability Tool Can't Observe: Langfuse, OpenTelemetry, and the Span That Was Too Large"
date: 2026-02
description: Debugging Langfuse, OpenTelemetry, and oversized span attributes caused by serializing binary data.
excerpt: When I added Langfuse tracing to an application, I expected the usual debugging cycle. What I didn't expect was the tracing infrastructure itself becoming the source of failures.
languages: python
---

When I added Langfuse tracing to an application, I expected the usual debugging cycle, missing spans, wrong nesting, maybe some async context issues. What I didn't expect was the tracing infrastructure itself becoming the source of failures.

#### The Setup

Langfuse's `@observe` decorator is elegant. Wrap a function, and it captures inputs, outputs, timing, and errors automatically:

```python
@observe(as_type="span")
async def my_function(arg1, arg2):
    ...
```

Under the hood, Langfuse v3 uses OpenTelemetry. Each `@observe` call creates an OTel span, and the function's arguments and return values are serialized as span attributes.

#### The Problem

After deploying tracing, spans started silently failing to export. No errors in the application logs, the functions ran fine, but traces were incomplete or missing entirely in the Langfuse dashboard.

The culprit was hiding in plain sight: some functions were receiving large binary data as arguments.

```python
@observe(as_type="span")
def do_something(data: BytesIO) -> bytes:
    ...
```

When `@observe` captures inputs, it serializes function arguments into span attributes. A `BytesIO` containing a 15MB file becomes a 15MB span attribute. If several functions in a call chain handle binary data, you're shipping hundreds of megabytes to your tracing backend per request.

OpenTelemetry has a default attribute value length limit, and even when it doesn't reject the data outright, the OTLP exporter struggles with payloads this large. Spans get dropped. The exporter backs up. Traces arrive incomplete.

#### The Fix (Two Parts)

**Part 1: Stop capturing binary data.** Langfuse's `@observe` accepts `capture_input` and `capture_output` parameters:

```python
@observe(as_type="span", capture_input=False, capture_output=False)
def do_something(data: BytesIO) -> bytes:
    ...
```

For functions that handle binary content, I disabled I/O capture. The span still records timing, errors, and nesting. You just don't get a multi-megabyte hex dump in your trace viewer.

**Part 2: Set the OTel attribute length limit.** As a safety net, I set `OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT=2000` in the environment. This truncates any attribute value that exceeds 2,000 characters, preventing a stray `str(some_large_object)` from blowing up span export.

#### What I Learned

The `@observe` decorator's default behavior, capture everything, is the right default for most functions. When your function takes a string prompt and returns a string response, automatic capture is pure upside. But the decorator doesn't distinguish between a 200-character prompt and a 20MB file buffer. It serializes whatever you give it.

The mental model that helped: think of span attributes like log lines. You wouldn't `logger.info(f"Processing: {twenty_mb_of_bytes}")`. Apply the same judgement to tracing.

**Functions that should have I/O capture disabled:**

- Anything that accepts or returns raw bytes or `BytesIO`
- File download or upload utilities
- Format conversion functions
- Anything where the input/output is opaque binary rather than structured data

**Functions that benefit from I/O capture:**

- LLM calls (prompts and responses are the whole point)
- Search/retrieval functions (queries and results)
- Business logic that transforms structured data

The irony isn't lost on me: I added observability to understand an application better, and the first thing I had to debug was the observability itself.
