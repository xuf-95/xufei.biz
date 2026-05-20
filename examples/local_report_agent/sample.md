# AI Agent Learning Notes

An AI Agent is a system that can understand a goal, inspect context, choose tools,
take actions, observe results, and continue until the task is complete.

The smallest useful Agent usually needs a planning step, a tool registry, a memory
store, and a verification step. The model is important, but the surrounding runtime
decides whether the Agent can act reliably.

For this project, the Agent reads local Markdown files, extracts summaries and
keywords, optionally calls web search, writes a Markdown report, and persists a JSON
trace of its memory.

This tiny workflow is enough to understand core Agent capabilities: planning,
tool calling, memory, environment feedback, and validation.
