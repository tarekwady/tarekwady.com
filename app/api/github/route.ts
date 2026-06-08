import { NextRequest, NextResponse } from "next/server";
import {
  fetchUserRepos,
  fetchRepoTree,
  fetchFileContent,
  getRepoNames,
  fetchRecentlyModifiedFiles,
} from "@/lib/github";

const ALLOWED_TYPES = new Set(["repos", "tree", "file", "recent-files"]);
const REPO_NAME_RE = /^[A-Za-z0-9._-]{1,100}$/;
const MAX_PATH_LENGTH = 500;

// When false, the `file` endpoint never returns real source code. The project
// tree (folder/file names) stays browsable so the desktop still feels alive,
// but file contents are kept private. Flip to true (or set
// EXPOSE_SOURCE_FILES=true) only if you intentionally want visitors to read
// your repositories' source through the Finder / iTerm apps.
const EXPOSE_SOURCE_FILES = process.env.EXPOSE_SOURCE_FILES === "true";

function privateFilePlaceholder(repo: string, path: string): string {
  const name = path.split("/").pop() || path;
  return [
    `// ${name}`,
    "//",
    "// This file's contents are private.",
    "//",
    "// You're browsing a recreation of macOS on the web. You can explore the",
    "// project structure, but the source code itself isn't served here.",
    `// View the public repository directly on GitHub if it's open source:`,
    `// https://github.com/tarekwady/${repo}`,
    "",
  ].join("\n");
}

function isValidRepoName(repo: string): boolean {
  return REPO_NAME_RE.test(repo);
}

function isValidRepoPath(path: string): boolean {
  if (!path || path.length > MAX_PATH_LENGTH) return false;
  if (path.startsWith("/") || path.includes("\\")) return false;
  return !path
    .split("/")
    .some((segment) => segment === "" || segment === "." || segment === "..");
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");
  const repo = searchParams.get("repo")?.trim();
  const path = searchParams.get("path")?.trim();

  if (!type || !ALLOWED_TYPES.has(type)) {
    return NextResponse.json(
      { error: "Invalid type. Use: repos, tree, file, or recent-files" },
      { status: 400 }
    );
  }

  try {
    switch (type) {
      case "repos": {
        const repos = await fetchUserRepos();
        return NextResponse.json({
          repos: getRepoNames(repos),
          details: repos.map((r) => ({
            name: r.name,
            description: r.description,
            language: r.language,
            stars: r.stargazers_count,
          })),
        });
      }

      case "tree": {
        if (!repo) {
          return NextResponse.json(
            { error: "repo parameter required" },
            { status: 400 }
          );
        }
        if (!isValidRepoName(repo)) {
          return NextResponse.json(
            { error: "Invalid repo parameter format" },
            { status: 400 }
          );
        }
        const tree = await fetchRepoTree(repo);
        return NextResponse.json({ tree });
      }

      case "file": {
        if (!repo || !path) {
          return NextResponse.json(
            { error: "repo and path parameters required" },
            { status: 400 }
          );
        }
        if (!isValidRepoName(repo)) {
          return NextResponse.json(
            { error: "Invalid repo parameter format" },
            { status: 400 }
          );
        }
        if (!isValidRepoPath(path)) {
          return NextResponse.json(
            { error: "Invalid path parameter format" },
            { status: 400 }
          );
        }
        if (!EXPOSE_SOURCE_FILES) {
          return NextResponse.json({ content: privateFilePlaceholder(repo, path) });
        }
        const content = await fetchFileContent(repo, path);
        return NextResponse.json({ content });
      }

      case "recent-files": {
        const recentFiles = await fetchRecentlyModifiedFiles();
        return NextResponse.json({ files: recentFiles });
      }
    }

    return NextResponse.json(
      { error: "Invalid type. Use: repos, tree, file, or recent-files" },
      { status: 400 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    if (message.includes("rate limit")) {
      return NextResponse.json(
        { error: "GitHub API rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    if (message.includes("not found")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
