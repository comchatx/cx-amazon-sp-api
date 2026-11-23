import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { body, typed } from "./pi.js";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const names = Object.keys((JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { comchatx: { prompts: Record<string, unknown> } }).comchatx.prompts);
const sentence = (name: string): string => {
  const front = /^---\n([\s\S]*?)\n---\n/.exec(readFileSync(join(ROOT, "prompts", `${name}.md`), "utf8"))?.[1] ?? "";
  const value = /^description: (.*)$/m.exec(front)?.[1] ?? "";
  return value.startsWith('"') ? (JSON.parse(value) as string) : value;
};
const sent = names;

it("each template's body is its description word for word, then the seller's own words", () => {
  for (const name of sent) expect(body(readFileSync(join(ROOT, "prompts", `${name}.md`), "utf8")), name).toBe(`${sentence(name)} $@\n`);
});

it("a typed /name reaches the model as the sentence, and /name with words after it as the sentence then the words", async () => {
  expect(sent.length).toBeGreaterThan(0);
  for (const name of sent) {
    expect((await typed(ROOT, `/${name}`)).trim(), name).toBe(sentence(name));
    expect((await typed(ROOT, `/${name} 只看英国站`)).trim(), name).toBe(`${sentence(name)} 只看英国站`);
  }
}, 120_000);
