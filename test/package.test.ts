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
  type Packed = { files: { path: string }[] };
  // npm 11 answers a list of packs and npm 12 an object keyed by the package's name.
  const answer = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: ROOT, encoding: "utf8" })) as Packed[] | Record<string, Packed>;
  const packed = Array.isArray(answer) ? answer : Object.values(answer);
  const shipped = ["skills", "prompts"].flatMap((directory) => walk(join(ROOT, directory)).map((path) => relative(ROOT, path)));
  expect(packed[0]!.files.map((file) => file.path).sort()).toEqual(["LICENSE", "README.md", "README.zh-CN.md", "package.json", ...shipped].sort());
  expect(manifest.files).toEqual(["skills", "prompts", "README.zh-CN.md"]);
});

const SKILL = readFileSync(join(ROOT, "skills", "amazon-sp-api", "SKILL.md"), "utf8");
const DOOR = readFileSync(join(ROOT, "skills", "amazon-sp-api", "references", "door.md"), "utf8");

it("names the five roles the developer application needs, Amazon Fulfillment among them", () => {
  const listed = /needs (\w+) roles: ([^.]+)\./.exec(DOOR);
  expect(listed?.[1]).toBe("five");
  expect(listed![2]!.replace(/, and |, /g, "|").split("|")).toEqual(["Product Listing", "Pricing", "Brand Analytics", "Finance and Accounting", "Amazon Fulfillment"]);
});

it("reads orders in its example with Orders 2026-01-01 searchOrders, not the v0 reads Amazon removes", () => {
  const example = /```sh\n(.+)\n```/.exec(SKILL)![1]!;
  expect(/--path (\S+)/.exec(example)![1]).toBe("/orders/2026-01-01/orders");
  expect(SKILL).not.toMatch(/--path \/orders\/v0\//);
});

it("states Amazon's own qualifications: grantless operations outside the seller and application rate, the datasets' roles as Amazon corrected them, and the Outbound operation Product Listing opens too", () => {
  expect(DOOR).toMatch(/most operations are rated for each seller and application, grantless operations being the exception/);
  expect(DOOR).not.toMatch(/rates each operation by a token bucket for each seller and application/);
  expect(DOOR).toMatch(/The Usage Plans and Rate Limits page states no `Retry-After` header\./);
  expect(DOOR).toMatch(/the Economics dataset needs Selling Partner Insights/);
  expect(DOOR).not.toMatch(/Brand Analytics for each dataset/);
  expect(DOOR).toMatch(/except `cancelFulfillmentOrder`, which that page names for Product Listing as well/);
});

it("declares its source in the shape the platform's catalogue reads: each field's label under `label`, each line in English and Chinese", () => {
  const source = (JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { comchatx: { source: { fields: Record<string, Record<string, unknown>>; lines: Record<string, unknown> } } }).comchatx.source;
  const words = (value: unknown): boolean => typeof value === "object" && value !== null && Object.keys(value).sort().join() === "en,zh"
    && Object.values(value).every((one) => typeof one === "string" && one.length > 0);
  expect(Object.keys(source.fields)).toEqual(["client_id", "client_secret", "refresh_token"]);
  for (const [field, declared] of Object.entries(source.fields)) {
    // The catalogue reads `label` and `help` under a field and nothing else: a field declared otherwise drops the whole source.
    expect(Object.keys(declared).every((key) => key === "label" || key === "help"), field).toBe(true);
    expect(words(declared["label"]), field).toBe(true);
  }
  expect(Object.keys(source.lines)).toEqual(["add", "removedWith"]);
  for (const [place, line] of Object.entries(source.lines)) expect(words(line), place).toBe(true);
});
