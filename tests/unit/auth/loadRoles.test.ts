import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { loadRoles, parseRoles } from "../../../src/stores/auth/loadRoles.js";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

describe("loadRoles", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    (globalThis as unknown as { localStorage: Storage }).localStorage = storage;
  });

  it("returns an empty array when nothing is stored", () => {
    assert.deepStrictEqual(loadRoles(storage), []);
  });

  it("parses roles from JSON when available", () => {
    storage.setItem("roles", JSON.stringify(["admin", "user"]));

    assert.deepStrictEqual(loadRoles(storage), ["admin", "user"]);
  });

  it("falls back to CSV parsing when JSON decoding fails", () => {
    storage.setItem("roles", "admin, manager , user");

    assert.deepStrictEqual(loadRoles(storage), ["admin", "manager", "user"]);
  });

  it("guards against malformed JSON-like strings", () => {
    assert.deepStrictEqual(parseRoles("not-json-but[looks]{like}it"), []);
  });

  it("uses the global localStorage instance by default", () => {
    storage.setItem("roles", JSON.stringify(["listener"]));

    assert.deepStrictEqual(loadRoles(), ["listener"]);
  });
});
