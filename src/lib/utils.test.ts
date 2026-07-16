import { test } from "node:test";
import assert from "node:assert";
import { shortenAddress, formatBalance, formatDate } from "./utils";

test("shortenAddress utility", () => {
  // Test null address
  assert.strictEqual(shortenAddress(null), "Not Connected");
  
  // Test short address
  assert.strictEqual(shortenAddress("GB3"), "GB3");

  // Test full length Stellar address
  const fullAddress = "GATDIP5U4G56ZXZ3S6S4SBTYVUKOQCS2N2NZXSQVNSQLQ22ZMXSQVLQA";
  assert.strictEqual(shortenAddress(fullAddress), "GATDIP...SQVLQA");
});

test("formatBalance utility", () => {
  // Test string balance
  assert.strictEqual(formatBalance("123.456"), "123.46");
  
  // Test number balance
  assert.strictEqual(formatBalance(123.4), "123.40");

  // Test custom decimals
  assert.strictEqual(formatBalance("12.3456", 3), "12.346");

  // Test invalid balance
  assert.strictEqual(formatBalance("invalid"), "0.00");
});

test("formatDate utility", () => {
  // Test standard ISO date
  assert.strictEqual(formatDate("2026-07-14T12:00:00.000Z"), "14 Jul 2026");

  // Test invalid date string
  assert.strictEqual(formatDate("invalid-date"), "—");
});
