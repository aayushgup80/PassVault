import { describe, expect, it } from "vitest";
import { canonicalOrigin, isExactOriginMatch } from "../src/security/domain.js";
describe("canonicalOrigin",()=>{it("normalizes URLs to origins",()=>expect(canonicalOrigin("https://Example.com/path?q=1")).toBe("https://example.com"));it("rejects non-web protocols",()=>expect(()=>canonicalOrigin("javascript:alert(1)")).toThrow());it("rejects URL-embedded credentials",()=>expect(()=>canonicalOrigin("https://user:pass@example.com")).toThrow());});
describe("isExactOriginMatch",()=>{it("matches only the exact origin",()=>{expect(isExactOriginMatch("https://example.com","https://example.com/login")).toBe(true);expect(isExactOriginMatch("https://example.com","https://sub.example.com")).toBe(false);});});
