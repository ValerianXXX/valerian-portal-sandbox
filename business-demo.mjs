// Public, original synthetic workflow. No production SDK, endpoint or private code.
export const KEY = "valerianPortalSandbox.business.v1";
export const initial = () => ({ version: 1, profile: null, request: "", draft: "", stage: "PROFILE", sources: [], history: [] });
const bounded = (value, limit) => typeof value === "string" && value.trim().length > 0 && value.length <= limit;
export function saveProfile(state, profile) {
  if (!bounded(profile.name, 80) || !bounded(profile.offering, 180) || !bounded(profile.hours, 100)) throw new Error("Complete all three synthetic profile fields within their limits.");
  return { ...initial(), history: state.history, profile: { ...profile, revision: (state.profile?.revision || 0) + 1 }, stage: "REQUEST" };
}
export function prepare(state, request) {
  if (!state.profile || !bounded(request, 600)) throw new Error("Save the synthetic business profile and describe a request first.");
  const profile = state.profile;
  return { ...state, request: request.trim(), stage: "PREPARED",
    draft: `Preparation for ${profile.name}\n\nRequest: ${request.trim()}\n\nUse the saved offering: ${profile.offering}. [Profile v${profile.revision}, offering]\nService hours: ${profile.hours}. [Profile v${profile.revision}, hours]\n\nDraft the activity around these confirmed example facts. Ask the owner for any requested budget, promotion dates or prices before adding them. Save this internal draft for review; publication and customer outcomes remain unverified.`,
    sources: [{ id: `profile-v${profile.revision}`, label: `Synthetic profile v${profile.revision}`, quote: `${profile.offering} · ${profile.hours}`, kind: "Browser-entered synthetic example" },
      { id: "request", label: "Current demo request", quote: request.trim(), kind: "Your synthetic input" }] };
}
export function edit(state, draft) {
  if (!state.profile || !state.sources.length || !bounded(draft, 4000)) throw new Error("Prepare and keep a nonempty draft under 4,000 characters.");
  return { ...state, draft, stage: "PREPARED" };
}
export function confirm(state, reviewed) {
  if (state.stage !== "PREPARED" || reviewed !== true) throw new Error("Review the sources and explicitly confirm the current draft.");
  return { ...state, stage: "CONFIRMED", history: [...state.history, { profileRevision: state.profile.revision, request: state.request, draft: state.draft, sources: state.sources }].slice(-20) };
}
export function continueWork(state) {
  if (state.stage !== "CONFIRMED") throw new Error("Confirm this draft before continuing.");
  return { ...state, stage: "CONTINUED" };
}
export function restore(text) {
  try {
    const state = JSON.parse(text);
    if (!state || state.version !== 1 || !["PROFILE", "REQUEST", "PREPARED", "CONFIRMED", "CONTINUED"].includes(state.stage) ||
        !Array.isArray(state.sources) || !Array.isArray(state.history) || state.history.length > 20 || typeof state.draft !== "string" || state.draft.length > 4000) return initial();
    if (state.stage === "PROFILE") return initial();
    if (!state.profile || !bounded(state.profile.name, 80) || !bounded(state.profile.offering, 180) || !bounded(state.profile.hours, 100) || !Number.isInteger(state.profile.revision)) return initial();
    if (state.stage !== "REQUEST" && (!bounded(state.request, 600) || !bounded(state.draft, 4000) || state.sources.length !== 2 || state.sources.some(row => !bounded(row.label, 120) || !bounded(row.quote, 600) || !bounded(row.kind, 80)))) return initial();
    return state;
  } catch { return initial(); }
}

function mount() {
  const root = document.querySelector("#business-journey");
  if (!root) return;
  let state;
  try { state = restore(localStorage.getItem(KEY)); } catch { state = initial(); }
  const byId = id => document.getElementById(id);
  const announce = text => { byId("journey-status").textContent = text; };
  const persist = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch { announce("Browser storage is unavailable. This draft remains in this tab only."); return false; }
  };
  function render() {
    byId("business-name").value = state.profile?.name || "Maple Table — synthetic";
    byId("business-offering").value = state.profile?.offering || "A fictional neighborhood dinner menu";
    byId("business-hours").value = state.profile?.hours || "Tuesday–Saturday, 5–9 pm";
    byId("business-request").value = state.request;
    byId("business-draft").value = state.draft;
    byId("request-form").hidden = !state.profile;
    byId("draft-review").hidden = !state.draft;
    byId("profile-saved").textContent = state.profile ? `${state.profile.name} · reusable profile v${state.profile.revision} · this browser` : "No profile saved yet";
    byId("draft-stage").textContent = ({ PROFILE: "Start with a business", REQUEST: "Ready for a request", PREPARED: "Prepared · review needed", CONFIRMED: "Confirmed · saved in this browser", CONTINUED: "Next step prepared · external work not performed" })[state.stage];
    byId("sources-reviewed").checked = false;
    byId("confirm-draft").disabled = state.stage !== "PREPARED";
    byId("continue-draft").disabled = state.stage !== "CONFIRMED";
    byId("next-step").hidden = state.stage !== "CONTINUED";
    byId("journey-sources").replaceChildren(...state.sources.map(source => {
      const item = document.createElement("li"), name = document.createElement("strong"), quote = document.createElement("p"), kind = document.createElement("small");
      name.textContent = source.label; quote.textContent = source.quote; kind.textContent = source.kind; item.append(name, quote, kind); return item;
    }));
    byId("saved-count").textContent = `${state.history.length} confirmed demo draft(s) retained in this browser.`;
  }
  const apply = (operation, message) => {
    try { state = operation(); render(); if (persist()) announce(message); }
    catch (error) { announce(error.message); }
  };
  byId("business-profile-form").addEventListener("submit", event => {
    event.preventDefault(); apply(() => saveProfile(state, { name: byId("business-name").value.trim(), offering: byId("business-offering").value.trim(), hours: byId("business-hours").value.trim() }), "Synthetic business profile saved. It can be reused for the next request.");
  });
  byId("request-form").addEventListener("submit", event => { event.preventDefault(); apply(() => prepare(state, byId("business-request").value), "Sample preparation is ready. Inspect its sources and missing information."); });
  byId("save-draft").addEventListener("click", () => apply(() => edit(state, byId("business-draft").value), "Changes saved; this revised draft needs a fresh confirmation."));
  byId("confirm-draft").addEventListener("click", () => apply(() => {
    const edited = byId("business-draft").value !== state.draft ? edit(state, byId("business-draft").value) : state;
    return confirm(edited, byId("sources-reviewed").checked);
  }, "Draft confirmed and saved locally. Nothing was published or sent."));
  byId("business-draft").addEventListener("input", () => { byId("sources-reviewed").checked = false; byId("continue-draft").disabled = true; byId("confirm-draft").disabled = true; announce("Save your changes before confirming the revised draft."); });
  byId("continue-draft").addEventListener("click", () => apply(() => continueWork(state), "An internal follow-up is prepared. Real publication or customer completion is outside this demo."));
  document.getElementById("reset-demo").addEventListener("click", () => { state = initial(); try { localStorage.removeItem(KEY); } catch {} render(); announce("Business profile, requests, drafts and history reset. No real account was changed."); });
  render();
}
if (typeof document !== "undefined") mount();
