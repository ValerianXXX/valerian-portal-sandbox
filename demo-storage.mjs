import { KEY, LEGACY_KEY, MAX_STORAGE_LENGTH, initial, restore } from "./demo-state.mjs";

const limits = { profile: { name: 80, offering: 180, hours: 100 }, request: 600, draft: 4000 };
export function cleanPending(value) {
  const result = {};
  if (!value || typeof value !== "object") return result;
  for (const field of ["request", "draft"]) if (typeof value[field] === "string" && value[field].length <= limits[field]) result[field] = value[field];
  if (value.profile && Object.entries(limits.profile).every(([key, max]) => typeof value.profile[key] === "string" && value.profile[key].length <= max)) {
    result.profile = Object.fromEntries(Object.keys(limits.profile).map(key => [key, value.profile[key]]));
  }
  return result;
}
export function createStore(storage) {
  let observed = null, revision = 0, unavailable = false;
  function read() {
    try {
      observed = storage.getItem(KEY); unavailable = false;
      if (observed === null) {
        const old = storage.getItem(LEGACY_KEY);
        return { state: restore(old), pending: {}, legacy: old !== null, unavailable: false };
      }
      if (observed.length > MAX_STORAGE_LENGTH) return { state: initial(), pending: {}, recovered: true };
      let raw;
      try { raw = JSON.parse(observed); } catch { return { state: initial(), pending: {}, recovered: true }; }
      if (raw?.format !== 1 || !Number.isSafeInteger(raw.revision) || raw.revision < 1) return { state: initial(), pending: {}, recovered: true };
      revision = raw.revision;
      const state = restore(JSON.stringify(raw.state));
      return { state, pending: cleanPending(raw.pending), recovered: JSON.stringify(state) !== JSON.stringify(raw.state) };
    } catch {
      unavailable = true;
      return { state: initial(), pending: {}, unavailable: true };
    }
  }
  function save(state, pending = {}) {
    if (unavailable) return false;
    let current;
    try { current = storage.getItem(KEY); } catch { unavailable = true; return false; }
    if (current !== observed) throw new Error("Another tab changed the saved demo. Load the latest saved demo before continuing.");
    const text = JSON.stringify({ format: 1, revision: revision + 1, state, pending: cleanPending(pending) });
    if (text.length > MAX_STORAGE_LENGTH || !Number.isSafeInteger(revision + 1)) throw new Error("Demo storage limit reached. Reset the synthetic demo.");
    try { storage.setItem(KEY, text); observed = text; revision++; return true; }
    catch { unavailable = true; return false; }
  }
  function reset() {
    try { storage.removeItem(KEY); storage.removeItem(LEGACY_KEY); observed = null; revision = 0; unavailable = false; return true; }
    catch { unavailable = true; return false; }
  }
  return { read, save, reset };
}
