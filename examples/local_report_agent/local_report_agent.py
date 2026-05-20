#!/usr/bin/env python3
"""
A tiny learning-oriented file report Agent.

It demonstrates the core Agent loop:
goal -> plan -> tool calls -> memory update -> verification -> Markdown report.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.parse
import urllib.request
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any


STOPWORDS = {
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "from",
    "are",
    "was",
    "were",
    "you",
    "your",
    "一个",
    "我们",
    "可以",
    "以及",
    "通过",
    "进行",
    "这个",
    "这些",
    "对于",
    "不是",
    "就是",
}


@dataclass
class AgentMemory:
    goal: str
    steps: list[dict[str, Any]] = field(default_factory=list)
    observations: list[str] = field(default_factory=list)
    artifacts: dict[str, str] = field(default_factory=dict)

    def remember_step(self, name: str, status: str, detail: str) -> None:
        self.steps.append(
            {
                "name": name,
                "status": status,
                "detail": detail,
                "time": datetime.now().isoformat(timespec="seconds"),
            }
        )

    def remember_observation(self, observation: str) -> None:
        self.observations.append(observation)


class FileReportAgent:
    def __init__(
        self,
        goal: str,
        input_paths: list[Path],
        output_path: Path,
        query: str | None,
        enable_search: bool,
        memory_path: Path,
    ) -> None:
        self.memory = AgentMemory(goal=goal)
        self.input_paths = input_paths
        self.output_path = output_path
        self.query = query
        self.enable_search = enable_search
        self.memory_path = memory_path

    def run(self) -> Path:
        plan = self.plan()
        documents = self.read_files(plan)
        summaries = self.summarize_documents(documents)
        search_results = self.search_web() if self.enable_search else []
        self.memory.remember_step("generate_report", "ok", "Rendered Markdown report.")
        report = self.generate_report(summaries, search_results)
        self.memory.remember_step("write_report", "ok", str(self.output_path))
        self.write_report(report)
        self.verify_report()
        report = self.generate_report(summaries, search_results)
        self.write_report(report)
        self.write_memory()
        return self.output_path

    def plan(self) -> list[str]:
        plan = [
            "Read local files",
            "Summarize each file",
            "Optionally search the web",
            "Generate Markdown report",
            "Verify report output",
        ]
        self.memory.remember_step("plan", "ok", " -> ".join(plan))
        return plan

    def read_files(self, plan: list[str]) -> list[dict[str, str]]:
        del plan
        documents: list[dict[str, str]] = []
        for path in self.input_paths:
            try:
                text = path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                text = path.read_text(encoding="utf-8", errors="ignore")
            documents.append({"path": str(path), "text": text})
            self.memory.remember_observation(
                f"Read {path} ({len(text)} characters)."
            )

        self.memory.remember_step("read_files", "ok", f"Loaded {len(documents)} file(s).")
        return documents

    def summarize_documents(self, documents: list[dict[str, str]]) -> list[dict[str, Any]]:
        summaries = []
        for document in documents:
            text = document["text"]
            keywords = extract_keywords(text, limit=8)
            summaries.append(
                {
                    "path": document["path"],
                    "summary": summarize_text(text),
                    "keywords": keywords,
                    "stats": {
                        "characters": len(text),
                        "words": len(tokenize(text)),
                        "paragraphs": count_paragraphs(text),
                    },
                }
            )

        self.memory.remember_step(
            "summarize_documents",
            "ok",
            f"Created {len(summaries)} extractive summary item(s).",
        )
        return summaries

    def search_web(self) -> list[dict[str, str]]:
        if not self.query:
            self.memory.remember_step("search_web", "skipped", "No query was provided.")
            return []

        url = "https://api.duckduckgo.com/?" + urllib.parse.urlencode(
            {
                "q": self.query,
                "format": "json",
                "no_html": "1",
                "skip_disambig": "1",
            }
        )

        try:
            with urllib.request.urlopen(url, timeout=8) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except Exception as exc:
            self.memory.remember_step("search_web", "error", str(exc))
            return [{"title": "Search unavailable", "url": "", "snippet": str(exc)}]

        results = []
        if payload.get("AbstractText"):
            results.append(
                {
                    "title": payload.get("Heading") or self.query,
                    "url": payload.get("AbstractURL") or "",
                    "snippet": payload["AbstractText"],
                }
            )

        for topic in payload.get("RelatedTopics", [])[:5]:
            if "Text" not in topic:
                continue
            results.append(
                {
                    "title": topic.get("FirstURL", self.query),
                    "url": topic.get("FirstURL", ""),
                    "snippet": topic["Text"],
                }
            )

        if not results:
            results = self.search_wikipedia()

        self.memory.remember_step("search_web", "ok", f"Collected {len(results)} result(s).")
        return results

    def search_wikipedia(self) -> list[dict[str, str]]:
        if not self.query:
            return []

        url = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode(
            {
                "action": "opensearch",
                "search": self.query,
                "limit": "5",
                "namespace": "0",
                "format": "json",
            }
        )

        try:
            with urllib.request.urlopen(url, timeout=8) as response:
                _, titles, snippets, urls = json.loads(response.read().decode("utf-8"))
        except Exception:
            return []

        results = []
        for title, snippet, item_url in zip(titles, snippets, urls):
            results.append(
                {
                    "title": title,
                    "url": item_url,
                    "snippet": snippet or "Wikipedia search result.",
                }
            )
        return results

    def generate_report(
        self,
        summaries: list[dict[str, Any]],
        search_results: list[dict[str, str]],
    ) -> str:
        lines = [
            "# Local File Agent Report",
            "",
            f"- Goal: {self.memory.goal}",
            f"- Generated at: {datetime.now().isoformat(timespec='seconds')}",
            f"- Files analyzed: {len(summaries)}",
            f"- Web search: {'enabled' if self.enable_search else 'disabled'}",
            "",
            "## Executive Summary",
            "",
        ]

        all_keywords = Counter()
        for item in summaries:
            all_keywords.update(item["keywords"])

        top_keywords = ", ".join(keyword for keyword, _ in all_keywords.most_common(10))
        lines.append(
            "The Agent read the provided local files, extracted key sentences, "
            "tracked intermediate state in memory, and generated this Markdown report."
        )
        if top_keywords:
            lines.append(f"Core keywords: {top_keywords}.")

        lines.extend(["", "## File Summaries", ""])
        for item in summaries:
            lines.extend(
                [
                    f"### {Path(item['path']).name}",
                    "",
                    f"- Source: `{item['path']}`",
                    f"- Characters: {item['stats']['characters']}",
                    f"- Words: {item['stats']['words']}",
                    f"- Paragraphs: {item['stats']['paragraphs']}",
                    f"- Keywords: {', '.join(item['keywords']) or 'n/a'}",
                    "",
                    item["summary"],
                    "",
                ]
            )

        if search_results:
            lines.extend(["## Web Search Observations", ""])
            for result in search_results:
                title = result["title"] or "Untitled"
                url = result["url"]
                if url:
                    lines.append(f"- [{title}]({url}): {result['snippet']}")
                else:
                    lines.append(f"- {title}: {result['snippet']}")
            lines.append("")

        lines.extend(
            [
                "## Agent Trace",
                "",
                "| Step | Status | Detail |",
                "| --- | --- | --- |",
            ]
        )
        for step in self.memory.steps:
            detail = step["detail"].replace("|", "\\|")
            lines.append(f"| {step['name']} | {step['status']} | {detail} |")

        lines.extend(
            [
                "",
                "## Learning Notes",
                "",
                "- Tool calling: file reading, optional web search, and report writing are separate tools.",
                "- Planning: the Agent creates a small execution plan before acting.",
                "- Memory: observations and step results are persisted as JSON.",
                "- Verification: the report is checked before the run is considered complete.",
            ]
        )
        return "\n".join(lines) + "\n"

    def write_report(self, report: str) -> None:
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        self.output_path.write_text(report, encoding="utf-8")
        self.memory.artifacts["report"] = str(self.output_path)

    def verify_report(self) -> None:
        text = self.output_path.read_text(encoding="utf-8")
        required_sections = ["# Local File Agent Report", "## File Summaries", "## Agent Trace"]
        missing = [section for section in required_sections if section not in text]
        if missing:
            self.memory.remember_step("verify_report", "error", f"Missing: {missing}")
            raise RuntimeError(f"Report verification failed. Missing sections: {missing}")
        self.memory.remember_step("verify_report", "ok", "Required report sections exist.")

    def write_memory(self) -> None:
        self.memory_path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "goal": self.memory.goal,
            "steps": self.memory.steps,
            "observations": self.memory.observations,
            "artifacts": self.memory.artifacts,
        }
        self.memory_path.write_text(
            json.dumps(payload, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )


def tokenize(text: str) -> list[str]:
    return re.findall(r"[\w\u4e00-\u9fff]+", text.lower())


def extract_keywords(text: str, limit: int) -> list[str]:
    counts = Counter(
        token
        for token in tokenize(text)
        if len(token) > 1 and token not in STOPWORDS and not token.isdigit()
    )
    return [word for word, _ in counts.most_common(limit)]


def count_paragraphs(text: str) -> int:
    return len([block for block in re.split(r"\n\s*\n", text.strip()) if block.strip()])


def summarize_text(text: str, sentence_limit: int = 5) -> str:
    clean = re.sub(r"\s+", " ", text).strip()
    if not clean:
        return "_No readable content found._"

    sentences = re.split(r"(?<=[。！？.!?])\s+", clean)
    sentences = [sentence.strip() for sentence in sentences if sentence.strip()]
    if len(sentences) <= sentence_limit:
        return "\n".join(f"- {sentence}" for sentence in sentences)

    keywords = set(extract_keywords(clean, limit=12))

    def score(sentence: str) -> int:
        words = set(tokenize(sentence))
        return len(words & keywords)

    ranked = sorted(enumerate(sentences), key=lambda item: score(item[1]), reverse=True)
    selected_indexes = sorted(index for index, _ in ranked[:sentence_limit])
    return "\n".join(f"- {sentences[index]}" for index in selected_indexes)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Read local files, summarize them, optionally search the web, and write a Markdown report."
    )
    parser.add_argument("files", nargs="+", type=Path, help="Local .md/.txt files to analyze.")
    parser.add_argument(
        "--goal",
        default="Summarize local files and produce a Markdown report.",
        help="Human-readable task goal stored in Agent memory.",
    )
    parser.add_argument(
        "--query",
        help="Optional web search query. Search runs only when this is provided.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("examples/local_report_agent/out/report.md"),
        help="Markdown report output path.",
    )
    parser.add_argument(
        "--memory",
        type=Path,
        default=Path("examples/local_report_agent/out/memory.json"),
        help="Agent memory JSON output path.",
    )
    parser.add_argument(
        "--no-search",
        action="store_true",
        help="Disable web search even when --query is provided.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    missing = [path for path in args.files if not path.exists()]
    if missing:
        for path in missing:
            print(f"Missing input file: {path}", file=sys.stderr)
        return 2

    agent = FileReportAgent(
        goal=args.goal,
        input_paths=args.files,
        output_path=args.output,
        query=args.query,
        enable_search=bool(args.query and not args.no_search),
        memory_path=args.memory,
    )
    report_path = agent.run()
    print(f"Report written to {report_path}")
    print(f"Memory written to {args.memory}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
