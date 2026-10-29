import { KEY, LEGACY_KEY, initial, saveProfile, prepare, edit, confirm, continueWork } from "./demo-state.mjs";
import { exampleProfile } from "./demo-template.mjs";
import { createStore } from "./demo-storage.mjs";
export { KEY, initial, saveProfile, prepare, edit, confirm, continueWork, restore } from "./demo-state.mjs";

function mount() {
  if (!document.querySelector("#business-journey")) return;
  const byId = id => document.getElementById(id);
  const announce = text => { byId("journey-status").textContent = text; };
  // Property access itself may throw when browser storage is disabled.
  const store = createStore({ getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value), removeItem: key => localStorage.removeItem(key) });
  let loaded = store.read(), state = loaded.state, pending = loaded.pending, conflict = false, durable = !loaded.unavailable;
  const dirty = () => Object.keys(pending).length > 0;
  const storageWarning = "Browser storage is unavailable. Changes remain in this tab only and may be lost on reload.";
  const profileInput = () => ({ name: byId("business-name").value, offering: byId("business-offering").value, hours: byId("business-hours").value });
  const sourceList = sources => sources.map(source => {
    const item = document.createElement("li"), name = document.createElement("strong"), quote = document.createElement("p"), kind = document.createElement("small");
    name.textContent = source.label; quote.textContent = source.quote; kind.textContent = source.kind; item.append(name, quote, kind); return item;
  });
  function controls() {
    byId("sources-reviewed").checked = false;
    byId("sources-reviewed").disabled = dirty() || conflict || state.stage !== "PREPARED";
    byId("confirm-draft").disabled = dirty() || conflict || state.stage !== "PREPARED";
    byId("continue-draft").disabled = dirty() || conflict || state.stage !== "CONFIRMED";
    byId("next-step").hidden = dirty() || conflict || state.stage !== "CONTINUED";
    byId("discard-changes").hidden = !dirty();
    byId("discard-changes").disabled = conflict;
    byId("reload-saved").hidden = !conflict;
    byId("pending-notice").hidden = !dirty();
    for (const id of ["business-profile-form", "request-form"]) byId(id).querySelector("button").disabled = conflict;
    byId("save-draft").disabled = conflict;
    byId("draft-stage").textContent = conflict ? "Another tab changed this demo — load its saved version" : dirty() ? "Unsaved changes · previous confirmation unavailable" : ({ PROFILE: "Start with a business", REQUEST: "Ready for a request", PREPARED: "Prepared · review needed", CONFIRMED: durable ? "Confirmed · saved in this browser" : "Confirmed · this tab only", CONTINUED: "Next step prepared · external work not performed" })[state.stage];
  }
  function render() {
    const profile = pending.profile || state.profile || exampleProfile;
    byId("business-name").value = profile.name; byId("business-offering").value = profile.offering; byId("business-hours").value = profile.hours;
    byId("business-request").value = pending.request ?? state.request;
    byId("business-draft").value = pending.draft ?? state.draft;
    byId("request-form").hidden = !state.profile;
    byId("draft-review").hidden = !state.draft;
    byId("profile-saved").textContent = state.profile ? `${state.profile.name} · reusable profile v${state.profile.revision} · ${durable ? "this browser" : "this tab only"}` : "No profile saved yet";
    byId("journey-sources").replaceChildren(...sourceList(state.sources));
    byId("saved-count").textContent = `${state.history.length} confirmed demo draft(s) retained in ${durable ? "this browser" : "this tab only"} (latest 20).`;
    byId("journey-history").replaceChildren(...state.history.slice().reverse().map(row => {
      const details = document.createElement("details"), summary = document.createElement("summary"), context = document.createElement("p"), draft = document.createElement("pre"), sources = document.createElement("ul");
      summary.textContent = `Demo draft #${row.id} · profile v${row.profileRevision} · ${row.legacy ? "legacy record; fresh review required" : row.continued ? "internal follow-up prepared" : "confirmed snapshot"}`;
      context.textContent = `${row.profile?.name || "Legacy synthetic profile"} — ${row.request}`; draft.textContent = row.draft; sources.append(...sourceList(row.sources));
      details.append(summary, context, draft, sources); return details;
    }));
    controls();
  }
  function persist(nextState, nextPending) {
    try { durable = store.save(nextState, nextPending); return durable; }
    catch (error) { conflict = true; controls(); announce(error.message); throw error; }
  }
  function apply(operation, nextPending, message) {
    if (conflict) return;
    try {
      const next = operation(), saved = persist(next, nextPending);
      state = next; pending = nextPending; render(); announce(saved ? message : storageWarning);
    } catch (error) { announce(error.message); }
  }
  function track(field, value, original) {
    if (JSON.stringify(value) === JSON.stringify(original)) delete pending[field]; else pending[field] = value;
    controls();
    try { announce(persist(state, pending) ? "Unsaved input is retained for recovery. Save or discard changes before confirming or continuing." : storageWarning); } catch { /* conflict is visible; keep tab input */ }
  }
  for (const id of ["business-name", "business-offering", "business-hours"]) byId(id).addEventListener("input", () => {
    const base = state.profile || exampleProfile;
    track("profile", profileInput(), { name: base.name, offering: base.offering, hours: base.hours });
  });
  byId("business-request").addEventListener("input", () => track("request", byId("business-request").value, state.request));
  byId("business-draft").addEventListener("input", () => track("draft", byId("business-draft").value, state.draft));
  byId("business-profile-form").addEventListener("submit", event => {
    event.preventDefault();
    if (pending.draft !== undefined) return announce("Save or discard draft changes before changing the business profile.");
    apply(() => saveProfile(state, profileInput()), pending.request === undefined ? {} : { request: pending.request }, "Synthetic profile saved. Changed profile facts require a new preparation and review.");
  });
  byId("request-form").addEventListener("submit", event => {
    event.preventDefault();
    if (pending.profile || pending.draft !== undefined) return announce("Save or discard profile and draft changes before preparing this request.");
    apply(() => prepare(state, byId("business-request").value), {}, "Sample preparation is ready. Inspect its sources and missing information.");
  });
  byId("save-draft").addEventListener("click", () => {
    if (pending.profile || pending.request !== undefined) return announce("Save or discard profile and request changes before saving the draft.");
    apply(() => edit(state, byId("business-draft").value), {}, "Draft saved. Changed content needs a fresh confirmation.");
  });
  byId("confirm-draft").addEventListener("click", () => { if (!dirty()) apply(() => confirm(state, byId("sources-reviewed").checked), {}, "Draft confirmed and saved locally. Nothing was published or sent."); });
  byId("continue-draft").addEventListener("click", () => { if (!dirty()) apply(() => continueWork(state), {}, "An internal follow-up is prepared. Real publication or customer completion is outside this demo."); });
  byId("discard-changes").addEventListener("click", () => apply(() => state, {}, "Unsaved edits discarded. The last saved version is shown."));
  byId("reload-saved").addEventListener("click", () => {
    loaded = store.read(); state = loaded.state; pending = loaded.pending; durable = !loaded.unavailable; conflict = false; render();
    announce(loaded.unavailable ? storageWarning : "Latest saved demo loaded. This tab's conflicting edits were discarded; inspect the recovered version.");
  });
  window.addEventListener("storage", event => {
    if (![KEY, LEGACY_KEY, null].includes(event.key)) return;
    conflict = true; controls(); announce("Another tab changed or reset the saved demo. Load the latest saved demo before continuing.");
  });
  byId("reset-demo").addEventListener("click", () => {
    const cleared = store.reset(); durable = cleared; state = initial(); pending = {}; conflict = false; render();
    announce(cleared ? "Business profile, requests, drafts and history reset. No real account was changed." : "This tab is reset, but browser storage could not be cleared. Older data may return after reload; clear site data in the browser.");
  });
  render();
  if (loaded.unavailable) announce(storageWarning);
  else if (loaded.legacy) announce("Previous demo data recovered. Legacy drafts require a fresh review; the old storage copy is retained until Reset demo.");
  else if (loaded.recovered) announce("Saved data required recovery. Inspect the available profile and draft before continuing.");
  else if (dirty()) announce("Unsaved changes recovered. Save or discard them before confirming or continuing.");
  else if (state.stage !== "PROFILE") announce(({ REQUEST: "Saved profile recovered. Describe the next synthetic request.", PREPARED: "Saved preparation recovered. Review its draft and sources before confirming.", CONFIRMED: "Confirmed snapshot recovered. It is ready for an internal demo follow-up.", CONTINUED: "Saved internal follow-up recovered. No external work has been performed." })[state.stage]);
}
if (typeof document !== "undefined") mount();
