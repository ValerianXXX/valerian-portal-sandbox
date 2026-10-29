import { sourcesFor, draftFor } from "./demo-template.mjs";

export const KEY = "valerianPortalSandbox.business.v2";
export const LEGACY_KEY = "valerianPortalSandbox.business.v1";
export const MAX_STORAGE_LENGTH = 500_000;
export const initial = () => ({ version: 2, profile: null, request: "", draft: "", stage: "PROFILE", sources: [], history: [], confirmationId: null, nextHistoryId: 1 });
const clone = value => JSON.parse(JSON.stringify(value));
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const bounded = (value, max) => typeof value === "string" && value.trim().length > 0 && value.length <= max;
const positive = value => Number.isSafeInteger(value) && value > 0 && value < Number.MAX_SAFE_INTEGER;
const profileFields = value => value && bounded(value.name, 80) && bounded(value.offering, 180) && bounded(value.hours, 100);
const profileCopy = value => ({ name: value.name.trim(), offering: value.offering.trim(), hours: value.hours.trim() });
const profileValid = value => profileFields(value) && positive(value.revision);
const profileSnapshot = value => ({ ...profileCopy(value), revision: value.revision });
const sourceValid = row => row && bounded(row.id, 100) && bounded(row.label, 120) && bounded(row.quote, 600) && bounded(row.kind, 80);
const sourceCopy = row => ({ id: row.id, label: row.label, quote: row.quote, kind: row.kind });
const sourcesValid = rows => Array.isArray(rows) && rows.length === 2 && rows.every(sourceValid);
const snapshot = state => ({ profile: profileSnapshot(state.profile), profileRevision: state.profile.revision, request: state.request, draft: state.draft, sources: clone(state.sources) });

function validDraft(state) {
  return profileValid(state.profile) && bounded(state.request, 600) && bounded(state.draft, 4000)
    && same(state.sources, sourcesFor(state.profile, state.request));
}
function reviewedVersion(state) {
  if (!validDraft(state) || !positive(state.confirmationId)) return false;
  const record = state.history.find(row => row.id === state.confirmationId && row.legacy !== true);
  return !!record && same(snapshot(state), snapshot(record));
}
export function saveProfile(state, profile) {
  if (!profileFields(profile)) throw new Error("Complete all three synthetic profile fields within their limits.");
  const fields = profileCopy(profile);
  if (state.profile && same(fields, profileCopy(state.profile))) return state;
  const revision = (state.profile?.revision || 0) + 1;
  if (!positive(revision)) throw new Error("Profile version limit reached. Reset the synthetic demo.");
  return { ...initial(), history: clone(state.history), nextHistoryId: state.nextHistoryId, profile: { ...fields, revision }, stage: "REQUEST" };
}
export function prepare(state, request) {
  if (!profileValid(state.profile) || !bounded(request, 600)) throw new Error("Save the synthetic business profile and describe a request first.");
  request = request.trim();
  const draft = draftFor(state.profile, request);
  if (state.request === request && state.draft === draft && validDraft(state)) return state;
  return { ...state, request, draft, stage: "PREPARED", confirmationId: null, sources: sourcesFor(state.profile, request) };
}
export function edit(state, draft) {
  if (!validDraft(state) || !bounded(draft, 4000)) throw new Error("Prepare and keep a nonempty draft under 4,000 characters.");
  if (state.draft === draft) return state;
  return { ...state, draft, stage: "PREPARED", confirmationId: null };
}
export function confirm(state, reviewed) {
  if (reviewed !== true) throw new Error("Review the sources and explicitly confirm the current draft.");
  if (["CONFIRMED", "CONTINUED"].includes(state.stage) && reviewedVersion(state)) return state;
  if (state.stage !== "PREPARED" || !validDraft(state)) throw new Error("Review the sources and explicitly confirm the current draft.");
  if (!positive(state.nextHistoryId)) throw new Error("History version limit reached. Reset the synthetic demo.");
  const id = state.nextHistoryId;
  return { ...state, stage: "CONFIRMED", confirmationId: id, nextHistoryId: id + 1,
    history: [...clone(state.history), { id, ...snapshot(state), continued: false }].slice(-20) };
}
export function continueWork(state) {
  if (!["CONFIRMED", "CONTINUED"].includes(state.stage) || !reviewedVersion(state)) throw new Error("Confirm the current reviewed version before continuing.");
  if (state.stage === "CONTINUED") return state;
  return { ...state, stage: "CONTINUED", history: state.history.map(row => row.id === state.confirmationId ? { ...clone(row), continued: true } : clone(row)) };
}

function historyRow(row, index, legacy) {
  if (!row || !bounded(row.request, 600) || !bounded(row.draft, 4000) || !sourcesValid(row.sources) || !positive(row.profileRevision)) return null;
  if (legacy || row.legacy === true) {
    if (!legacy && !positive(row.id)) return null;
    return { id: legacy ? index + 1 : row.id, profileRevision: row.profileRevision, request: row.request, draft: row.draft, sources: row.sources.map(sourceCopy), legacy: true, continued: false };
  }
  if (!positive(row.id) || !profileValid(row.profile) || row.profile.revision !== row.profileRevision || !same(row.sources, sourcesFor(row.profile, row.request))) return null;
  return { id: row.id, ...snapshot(row), continued: row.continued === true };
}
export function restore(text) {
  try {
    if (typeof text !== "string" || text.length > MAX_STORAGE_LENGTH) return initial();
    const raw = JSON.parse(text), legacy = raw?.version === 1;
    if (!raw || ![1, 2].includes(raw.version) || !["PROFILE", "REQUEST", "PREPARED", "CONFIRMED", "CONTINUED"].includes(raw.stage)
      || !Array.isArray(raw.history) || raw.history.length > 20 || !Array.isArray(raw.sources) || raw.sources.length > 2) return initial();
    if (raw.stage === "PROFILE" || !profileValid(raw.profile)) return initial();
    const history = raw.history.map((row, index) => historyRow(row, index, legacy)).filter(Boolean);
    if (new Set(history.map(row => row.id)).size !== history.length) return initial();
    const state = { ...initial(), profile: profileSnapshot(raw.profile), stage: "REQUEST", history,
      nextHistoryId: Math.max(legacy ? 1 : (positive(raw.nextHistoryId) ? raw.nextHistoryId : 1), ...history.map(row => row.id + 1)) };
    if (raw.stage === "REQUEST") return state;
    if (!bounded(raw.request, 600) || !bounded(raw.draft, 4000)) return state;
    Object.assign(state, { request: raw.request, draft: raw.draft, stage: "PREPARED", sources: sourcesFor(state.profile, raw.request) });
    // Local snapshots prevent accidental stale approval, not deliberate browser-storage forgery.
    if (!legacy && same(raw.sources, state.sources) && positive(raw.confirmationId)) {
      state.confirmationId = raw.confirmationId;
      if (reviewedVersion(state) && ["CONFIRMED", "CONTINUED"].includes(raw.stage)) {
        const record = history.find(row => row.id === state.confirmationId);
        state.stage = raw.stage === "CONTINUED" && record.continued === true ? "CONTINUED" : "CONFIRMED";
      }
      else state.confirmationId = null;
    }
    return state;
  } catch { return initial(); }
}
