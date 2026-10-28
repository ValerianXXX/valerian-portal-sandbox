import test from "node:test";
import assert from "node:assert/strict";
import { initial, saveProfile, prepare, edit, confirm, continueWork, restore } from "./business-demo.mjs";
const profile = { name: "Synthetic Maple", offering: "Dinner", hours: "5–9 pm" };
test("business to sourced preparation to reviewed continuation survives reload", () => {
  let state = saveProfile(initial(), profile);
  state = prepare(state, "Prepare a Tuesday dinner activity.");
  assert.equal(state.sources.length, 2);
  assert.match(state.draft, /Profile v1/);
  state = edit(state, state.draft + "\nOwner review remains required.");
  assert.throws(() => confirm(state, false), /explicitly/);
  state = confirm(state, true);
  assert.equal(restore(JSON.stringify(state)).stage, "CONFIRMED");
  state = continueWork(state);
  assert.equal(state.stage, "CONTINUED");
  assert.equal(state.history.length, 1);
  assert.equal(prepare(state, "A new synthetic request").profile.revision, 1);
});
test("edits and profile changes require a new source review", () => {
  let state = confirm(prepare(saveProfile(initial(), profile), "Request"), true);
  state = edit(state, "Revised synthetic draft");
  assert.throws(() => continueWork(state), /Confirm/);
  state = saveProfile(state, { ...profile, hours: "6–9 pm" });
  assert.equal(state.stage, "REQUEST"); assert.equal(state.draft, ""); assert.equal(state.profile.revision, 2);
});
test("corrupt storage and unsupported shapes reset without execution", () => {
  for (const text of ["{", "null", '{}', JSON.stringify({ ...initial(), stage: "CONFIRMED" })]) assert.deepEqual(restore(text), initial());
  assert.throws(() => prepare(initial(), "Request"));
  assert.throws(() => saveProfile(initial(), { ...profile, name: "" }));
});
