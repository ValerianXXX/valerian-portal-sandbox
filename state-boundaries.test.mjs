import test from "node:test";
import assert from "node:assert/strict";
import * as demo from "./business-demo.mjs";

const profile = { name: "Synthetic Maple", offering: "Dinner", hours: "5–9 pm" };
const prepared = () => demo.prepare(demo.saveProfile(demo.initial(), profile), "Prepare a synthetic dinner plan.");
const confirmed = () => demo.confirm(prepared(), true);
const roundtrip = state => demo.restore(JSON.stringify(state));

test("confirmation is idempotent for the same reviewed version", () => {
  const state = confirmed();
  assert.deepEqual(demo.confirm(state, true), state);
});
test("continuation is idempotent and cannot add business outcomes", () => {
  const state = demo.continueWork(confirmed());
  assert.deepEqual(demo.continueWork(state), state);
  assert.equal(state.history.length, 1);
});
test("unchanged profile save preserves current review", () => {
  const state = confirmed();
  assert.deepEqual(demo.saveProfile(state, { ...profile }), state);
});
test("unchanged draft save preserves current review", () => {
  const state = confirmed();
  assert.deepEqual(demo.edit(state, state.draft), state);
});
test("negative profile revisions are not restored", () => {
  const state = prepared(); state.profile.revision = -4;
  assert.equal(roundtrip(state).profile, null);
});
test("unknown profile properties are discarded", () => {
  const state = demo.saveProfile(demo.initial(), { ...profile, hiddenCustomer: "must not be retained" });
  assert.equal(state.profile.hiddenCustomer, undefined);
});
test("history snapshots do not share source objects with current state", () => {
  const state = confirmed();
  state.sources[0].quote = "Changed current source";
  assert.notEqual(state.history[0].sources[0].quote, state.sources[0].quote);
});
test("restoring a changed draft cannot retain confirmation", () => {
  const state = confirmed(); state.draft += " Changed after approval.";
  assert.notEqual(roundtrip(state).stage, "CONFIRMED");
});
test("restoring changed source evidence cannot retain confirmation", () => {
  const state = confirmed(); state.sources[0].quote = "Different facts";
  assert.notEqual(roundtrip(state).stage, "CONFIRMED");
});
test("restoring a changed request cannot retain confirmation", () => {
  const state = confirmed(); state.request = "Different request";
  assert.notEqual(roundtrip(state).stage, "CONFIRMED");
});
test("continuation rejects a mismatched review snapshot", () => {
  const state = confirmed(); state.draft += " Unreviewed change.";
  assert.throws(() => demo.continueWork(state), /confirm|review|version/i);
});
test("malformed history is not silently restored as reviewed work", () => {
  const state = prepared(); state.history = [{ request: 3, draft: null, sources: "invalid" }];
  assert.equal(roundtrip(state).history.length, 0);
});
test("source labels remain tied to the saved profile and request", () => {
  const state = prepared(); state.sources[0].label = "A real customer outcome";
  assert.notEqual(roundtrip(state).sources[0]?.label, "A real customer outcome");
});
test("restore rejects excessive serialized input before retaining it", () => {
  const state = prepared(); state.ignored = "x".repeat(1_000_001);
  assert.deepEqual(roundtrip(state), demo.initial());
});
test("valid revised draft still needs explicit review and survives reload", () => {
  let state = demo.edit(confirmed(), "A revised synthetic draft; budget is still unknown.");
  assert.throws(() => demo.confirm(state, false), /explicitly/i);
  state = demo.confirm(state, true);
  assert.equal(roundtrip(state).stage, "CONFIRMED");
  assert.equal(state.history.length, 2);
});
test("reset creates a fresh independent collection", () => {
  const first = demo.initial(); first.history.push({ marker: true });
  assert.deepEqual(demo.initial().history, []);
});
