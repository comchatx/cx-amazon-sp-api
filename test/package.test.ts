import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DefaultResourceLoader, SettingsManager } from "@earendil-works/pi-coding-agent";
import { afterEach, expect, it } from "vitest";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const manifest = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { pi: unknown; files: unknown; comchatx: { skills: Record<string, unknown>; prompts: Record<string, unknown> } };
const scratches: string[] = [];
afterEach(() => { for (const scratch of scratches.splice(0)) rmSync(scratch, { recursive: true, force: true }); });

const walk = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)]));

it("the pinned pi lists the package's skills and templates as its manifest names them, with nothing it could not read", async () => {
  const home = mkdtempSync(join(tmpdir(), "pi-package-"));
  scratches.push(home);
  const agentDir = join(home, "agent");
  const cwd = join(home, "project");
  for (const directory of [agentDir, cwd]) mkdirSync(directory);
  writeFileSync(join(agentDir, "settings.json"), JSON.stringify({ defaultProjectTrust: "always", packages: [ROOT] }));
  const loader = new DefaultResourceLoader({ cwd, agentDir, settingsManager: SettingsManager.create(cwd, agentDir) });
  await loader.reload();
  const { skills, diagnostics } = loader.getSkills();
  expect(diagnostics).toEqual([]);
  expect(manifest.pi).toEqual({ skills: ["./skills"], prompts: ["./prompts"] });
  // The Plugins page names a package's skills from its `comchatx` field alone.
  expect(skills.map((skill) => skill.name).sort()).toEqual(Object.keys(manifest.comchatx.skills).sort());
  for (const skill of skills) expect(skill.description.trim(), skill.name).not.toBe("");
  // Its Try it cards are its templates, each named in the field for its Chinese, each with words pi reads from its front matter.
  const { prompts, diagnostics: unread } = loader.getPrompts();
  expect(unread).toEqual([]);
  expect(prompts.map((prompt) => prompt.name).sort()).toEqual(Object.keys(manifest.comchatx.prompts).sort());
  for (const prompt of prompts) expect(prompt.description.trim(), prompt.name).not.toBe("");
});

it("ships its skills, its templates, its READMEs and its license, and nothing else", () => {
  const packed = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: ROOT, encoding: "utf8" })) as { files: { path: string }[] }[];
  const shipped = ["skills", "prompts"].flatMap((directory) => walk(join(ROOT, directory)).map((path) => relative(ROOT, path)));
  expect(packed[0]!.files.map((file) => file.path).sort()).toEqual(["LICENSE", "README.md", "README.zh-CN.md", "package.json", ...shipped].sort());
  expect(manifest.files).toEqual(["skills", "prompts", "README.zh-CN.md"]);
});
