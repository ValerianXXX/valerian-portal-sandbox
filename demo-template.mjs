// Original deterministic example, not a model response or a business outcome.
export const exampleProfile = Object.freeze({ name: "Maple Table — synthetic", offering: "A fictional neighborhood dinner menu", hours: "Tuesday–Saturday, 5–9 pm" });
export function sourcesFor(profile, request) {
  return [
    { id: `profile-v${profile.revision}`, label: `Synthetic profile v${profile.revision}`, quote: `${profile.offering} · ${profile.hours}`, kind: "Browser-entered synthetic example" },
    { id: "request", label: "Current demo request", quote: request, kind: "Your synthetic input" },
  ];
}
export function draftFor(profile, request) {
  return `Preparation for ${profile.name}\n\nRequest: ${request}\n\nUse the saved offering: ${profile.offering}. [Profile v${profile.revision}, offering]\nService hours: ${profile.hours}. [Profile v${profile.revision}, hours]\n\nDraft the activity around these confirmed example facts. Ask the owner for any requested budget, promotion dates or prices before adding them. Save this internal draft for review; publication and customer outcomes remain unverified.`;
}
