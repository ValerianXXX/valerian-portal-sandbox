import test from "node:test";
import assert from "node:assert/strict";
import { initial, saveProfile, prepare, confirm, continueWork, restore, KEY, LEGACY_KEY } from "./demo-state.mjs";
import { createStore, cleanPending } from "./demo-storage.mjs";
const profile = { name: "Synthetic Maple", offering: "Dinner", hours: "5–9 pm" };
const prepared = () => prepare(saveProfile(initial(), profile), "Prepare a fictional dinner.");
const memory = () => {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
};
test("pending blank and edited inputs survive reload without replacing reviewed facts", () => {
  const storage = memory(), store = createStore(storage); store.read();
  const state = confirm(prepared(), true), pending = { profile: { ...profile, name: "" }, request: "New request", draft: "" };
  assert.equal(store.save(state, pending), true);
  const loaded = createStore(storage).read();
  assert.deepEqual(loaded.pending, pending); assert.deepEqual(loaded.state, state);
});
test("a stale tab cannot overwrite a newer saved version", () => {
  const storage = memory(), a = createStore(storage), b = createStore(storage); a.read(); b.read();
  a.save(prepared()); const original = storage.getItem(KEY);
  assert.throws(() => b.save(initial()), /Another tab/); assert.equal(storage.getItem(KEY), original);
  b.read(); b.save(initial()); assert.equal(createStore(storage).read().state.stage, "PROFILE");
});
test("a reset in another tab cannot be silently undone by a stale writer", () => {
  const storage = memory(), a = createStore(storage); a.read(); a.save(prepared());
  const b = createStore(storage); b.read(); b.reset();
  assert.throws(() => a.save(prepared()), /Another tab/);
});
test("read and write failures are explicit and do not claim persistence", () => {
  const broken = { getItem() { throw Error("denied"); } };
  const store = createStore(broken); assert.equal(store.read().unavailable, true); assert.equal(store.save(prepared()), false); assert.equal(store.reset(), false);
  const storage = memory(), writer = createStore(storage); writer.read();
  storage.setItem = () => { throw Error("quota"); }; assert.equal(writer.save(prepared()), false);
});
test("legacy migration preserves text and records but requires fresh confirmation", () => {
  const state = confirm(prepared(), true);
  const legacy = { ...state, version: 1, history: state.history.map(({ id, profile: ignored, continued, ...row }) => row) };
  const storage = memory(); storage.setItem(LEGACY_KEY, JSON.stringify(legacy));
  const store = createStore(storage), loaded = store.read();
  assert.equal(loaded.legacy, true); assert.equal(loaded.state.stage, "PREPARED"); assert.equal(loaded.state.history[0].legacy, true);
  assert.equal(loaded.state.draft, state.draft); store.save(loaded.state); assert.ok(storage.getItem(LEGACY_KEY));
  store.reset(); assert.equal(storage.getItem(LEGACY_KEY), null); assert.equal(storage.getItem(KEY), null);
});
test("history remains bounded and independent after many revisions", () => {
  let state = prepared();
  for (let i = 0; i < 25; i++) { state = prepare(state, `Request ${i}`); state = confirm(state, true); state = continueWork(state); }
  assert.equal(state.history.length, 20); assert.equal(state.history[0].id, 6);
  assert.deepEqual(restore(JSON.stringify(state)), state);
});
test("unknown and oversized pending fields cannot expand the saved envelope", () => {
  assert.deepEqual(cleanPending({ request: "x".repeat(601), draft: 7, profile: { ...profile, name: "x".repeat(81) }, secret: "not retained" }), {});
});
test("continued state requires a matching historical snapshot after reload", () => {
  const state = continueWork(confirm(prepared(), true)); state.profile.hours = "Changed hours";
  assert.equal(restore(JSON.stringify(state)).stage, "PREPARED");
});
test("legacy history IDs survive bounded modern history round trips", () => {
  const old = { ...prepared(), version: 1, history: [{ profileRevision: 1, request: "Legacy request", draft: "Legacy draft", sources: prepared().sources }] };
  let state = restore(JSON.stringify(old));
  for (let i = 0; i < 22; i++) { state = confirm(prepare(state, `Modern ${i}`), true); state = restore(JSON.stringify(state)); }
  assert.equal(state.history.length, 20); assert.equal(state.history[0].id, 4); assert.equal(state.stage, "CONFIRMED");
});
test("corrupt JSON is distinguished from unavailable storage and can be reset", () => {
  const storage = memory(); storage.setItem(KEY, "{bad"); const store = createStore(storage);
  const loaded = store.read(); assert.equal(loaded.recovered, true); assert.notEqual(loaded.unavailable, true);
  assert.equal(store.save(prepared()), true); assert.equal(createStore(storage).read().state.stage, "PREPARED");
});
test("restored continuation must also appear in its saved history event", () => {
  const state = confirm(prepared(), true); state.stage = "CONTINUED";
  assert.equal(restore(JSON.stringify(state)).stage, "CONFIRMED");
});
test("malformed legacy record IDs cannot poison modern counters", () => {
  const state = prepared(); state.history = [{ ...confirm(state, true).history[0], legacy: true, id: null }];
  const loaded = restore(JSON.stringify(state)); assert.equal(loaded.history.length, 0); assert.equal(loaded.nextHistoryId, 1);
});
