(() => {
  "use strict";

  const STORAGE_KEY = "valerianPortalSandbox.v2";

  const industries = {
    lending: {
      name: "Aster Lending Sandbox",
      shortName: "Aster Lending Sandbox",
      initials: "AL",
      eyebrow: "Opportunity intelligence",
      title: "Turn scattered signals into your next best move.",
      description: "A calm operating view for applications, borrower activity and the work that needs attention now.",
      modules: {
        accounts: "Companies",
        contacts: "Borrowers",
        leads: "Applications",
        campaigns: "Outreach",
        reports: "Portfolio",
        settings: "Workspace settings",
      },
      metrics: [
        ["Active applications", "28", "+6 this week", "positive"],
        ["Qualified", "12", "43% conversion", ""],
        ["Open tasks", "9", "3 due today", "attention"],
        ["Signal score", "84", "Healthy momentum", ""],
      ],
      signals: [
        [91, "Aster Ridge renewed interest", "Pricing guidance revisited after 14 quiet days.", "High intent", "indigo"],
        [82, "Three borrowers joined one company", "A potential decision group is forming at Blue Oak Trading.", "Relationship", "teal"],
        [76, "Follow-up window is closing", "Four qualified applications have no next step.", "Action needed", "coral"],
      ],
      recordNames: {
        accounts: ["Aster Ridge Holdings", "Blue Oak Trading", "Riverbend Advisors", "Cedar Lane Works"],
        contacts: ["Alex Morgan", "Priya Shah", "Jordan Ellis", "Noah Rivera"],
        leads: ["Acquisition bridge request", "Retail refinance", "Working capital review", "Owner-occupied purchase"],
        campaigns: ["Dormant application re-engagement", "Borrower document reminder", "Referral partner follow-up", "Rate-change education"],
        reports: ["Weekly pipeline health", "Application aging", "Source performance", "Team response time"],
        settings: ["Application routing", "Required borrower fields", "Follow-up policy", "Team access"],
      },
    },
    marketing: {
      name: "Cobalt Social Sandbox",
      shortName: "Cobalt Social Sandbox",
      initials: "CS",
      eyebrow: "Campaign intelligence",
      title: "See which audience signals deserve action.",
      description: "Bring prospects, campaigns and content momentum into one focused operating view.",
      modules: {
        accounts: "Clients",
        contacts: "Contacts",
        leads: "Prospects",
        campaigns: "Campaigns",
        reports: "Analytics",
        settings: "Workspace settings",
      },
      metrics: [
        ["Active prospects", "146", "+18 this week", "positive"],
        ["Campaigns", "7", "4 above target", ""],
        ["Open tasks", "14", "5 due today", "attention"],
        ["Signal score", "88", "Strong engagement", ""],
      ],
      signals: [
        [94, "Launch reel is accelerating", "Saves and qualified replies rose in the last six hours.", "Momentum", "indigo"],
        [86, "One client segment is outperforming", "Founder-led brands convert 2.4× above the current average.", "Audience", "teal"],
        [71, "Approval delay is creating risk", "Three scheduled posts are waiting for a client decision.", "Action needed", "coral"],
      ],
      recordNames: {
        accounts: ["Sora Home Goods", "Moss Skincare", "Fieldstone Coffee", "Orbit Learning Lab"],
        contacts: ["Maya Lin", "Elliot Reed", "Nina Patel", "Sam Rivera"],
        leads: ["Creator collaboration", "Spring launch inquiry", "Restaurant growth brief", "Brand refresh request"],
        campaigns: ["Summer discovery series", "Founder story launch", "Neighborhood conversion", "Dormant audience return"],
        reports: ["Weekly content pulse", "Channel conversion", "Audience cohort health", "Creative response time"],
        settings: ["Client approval flow", "Content taxonomy", "Campaign stages", "Team access"],
      },
    },
    hospitality: {
      name: "Maple Dining Sandbox",
      shortName: "Maple Dining Sandbox",
      initials: "MD",
      eyebrow: "Guest intelligence",
      title: "Keep every location moving in one rhythm.",
      description: "Track reservations, guest patterns and daily operating priorities without unnecessary complexity.",
      modules: {
        accounts: "Locations",
        contacts: "Guests",
        leads: "Reservations",
        campaigns: "Events",
        reports: "Operations",
        settings: "Workspace settings",
      },
      metrics: [
        ["Today’s covers", "214", "+22 vs forecast", "positive"],
        ["Returning guests", "38%", "Up 4 points", ""],
        ["Open tasks", "11", "4 before service", "attention"],
        ["Service score", "91", "Excellent rhythm", ""],
      ],
      signals: [
        [93, "Friday demand passed forecast", "The downtown dining room is nearing its preferred capacity.", "Demand", "indigo"],
        [84, "Regular guests are returning", "Twelve high-frequency guests booked again this month.", "Loyalty", "teal"],
        [72, "One shift needs coverage", "The evening host position is not yet assigned.", "Action needed", "coral"],
      ],
      recordNames: {
        accounts: ["Maple Downtown", "Maple Riverside", "Maple Market", "Maple Catering"],
        contacts: ["Olivia Lane", "Theo Miles", "Amara Wells", "Lucas Dean"],
        leads: ["Friday table for six", "Private dining inquiry", "Anniversary reservation", "Corporate lunch request"],
        campaigns: ["Chef’s table weekend", "Local guest return", "Holiday private dining", "Neighborhood tasting night"],
        reports: ["Daily service pulse", "Reservation mix", "Guest return rate", "Location task health"],
        settings: ["Reservation rules", "Guest preferences", "Location hours", "Team access"],
      },
    },
    wellness: {
      name: "Linden Wellness Sandbox",
      shortName: "Linden Wellness Sandbox",
      initials: "LW",
      eyebrow: "Client intelligence",
      title: "Make every client visit feel thoughtfully connected.",
      description: "A clear view of appointments, preferences and retention signals for a growing wellness team.",
      modules: {
        accounts: "Studios",
        contacts: "Clients",
        leads: "Appointments",
        campaigns: "Retention",
        reports: "Performance",
        settings: "Workspace settings",
      },
      metrics: [
        ["Appointments", "64", "+9 this week", "positive"],
        ["Returning clients", "71%", "Up 6 points", ""],
        ["Open tasks", "7", "2 due today", "attention"],
        ["Client score", "89", "Strong retention", ""],
      ],
      signals: [
        [92, "Rebooking intent is rising", "Eight clients viewed availability within 48 hours of a visit.", "Retention", "indigo"],
        [81, "A service bundle is emerging", "Massage and skin-care pairings are growing across two studios.", "Pattern", "teal"],
        [74, "Two follow-ups are overdue", "First-time clients have not received their care guidance.", "Action needed", "coral"],
      ],
      recordNames: {
        accounts: ["Linden Midtown", "Linden Garden", "Linden Mobile", "Linden Academy"],
        contacts: ["Sofia Bell", "Aria Park", "Miles Green", "Layla Stone"],
        leads: ["Recovery massage", "New client consultation", "Skin-care follow-up", "Group wellness booking"],
        campaigns: ["First-visit rebooking", "Seasonal recovery series", "Membership renewal", "Lapsed client return"],
        reports: ["Weekly appointment pulse", "Client retention", "Service mix", "Practitioner capacity"],
        settings: ["Appointment policy", "Client intake fields", "Service catalog", "Team access"],
      },
    },
  };

  const roleAccess = {
    Owner: ["command", "accounts", "contacts", "leads", "assistant", "campaigns", "reports", "settings"],
    Administrator: ["command", "accounts", "contacts", "leads", "assistant", "campaigns", "reports", "settings"],
    Manager: ["command", "accounts", "contacts", "leads", "assistant", "campaigns", "reports"],
    Member: ["command", "accounts", "contacts", "leads", "assistant"],
  };

  const roleMessages = {
    Owner: "Owner preview · all demo modules visible",
    Administrator: "Administrator preview · workspace configuration available",
    Manager: "Manager preview · team operations and reporting available",
    Member: "Member preview · assigned operating modules only",
  };

  const statusPatterns = [
    ["Healthy", "healthy"],
    ["Needs attention", "attention"],
    ["Review", "neutral"],
    ["Healthy", "healthy"],
  ];

  const contextPatterns = ["Updated 18 minutes ago", "No next step assigned", "Human review requested", "Updated yesterday"];
  const ownerPatterns = ["Valerian Sandbox", "Maya Lin", "Operations Team", "Jordan Ellis"];
  const nextStepPatterns = ["Review activity", "Set next step", "Confirm details", "Open summary"];

  const defaultState = {
    industry: "lending",
    role: "Owner",
    collapsed: false,
    activeModule: "command",
    activeFilter: "all",
    query: "",
    addedRecords: {},
  };

  function readState() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      return {
        ...defaultState,
        ...saved,
        industry: industries[saved?.industry] ? saved.industry : defaultState.industry,
        role: roleAccess[saved?.role] ? saved.role : defaultState.role,
        addedRecords: saved?.addedRecords && typeof saved.addedRecords === "object" ? saved.addedRecords : {},
      };
    } catch {
      return { ...defaultState };
    }
  }

  let state = readState();
  let toastTimer;

  const elements = {
    shell: document.querySelector("#app-shell"),
    sidebarToggle: document.querySelector("#sidebar-toggle"),
    mobileMenu: document.querySelector("#mobile-menu-button"),
    roleSelect: document.querySelector("#role-select"),
    roleNote: document.querySelector("#role-note"),
    workspaceDialog: document.querySelector("#workspace-dialog"),
    workspaceSwitcher: document.querySelector("#workspace-switcher"),
    workspaceName: document.querySelector("#workspace-name"),
    workspaceAvatar: document.querySelector("#workspace-avatar"),
    topbarWorkspace: document.querySelector("#topbar-workspace"),
    topbarView: document.querySelector("#topbar-view"),
    globalSearch: document.querySelector("#global-search"),
    dashboard: document.querySelector("#command-center"),
    recordsView: document.querySelector("#records-view"),
    assistantView: document.querySelector("#assistant-view"),
    recordsTitle: document.querySelector("#records-title"),
    recordsDescription: document.querySelector("#records-description"),
    recordsEyebrow: document.querySelector("#records-eyebrow"),
    recordsHead: document.querySelector("#records-head"),
    recordsBody: document.querySelector("#records-body"),
    recordCount: document.querySelector("#record-count"),
    recordAction: document.querySelector("#record-action"),
    toast: document.querySelector("#toast"),
    assistantInput: document.querySelector("#assistant-input"),
    chatThread: document.querySelector("#chat-thread"),
    attachmentName: document.querySelector("#attachment-name"),
  };

  function saveState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("visible");
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("visible"), 2600);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setSidebarState(collapsed) {
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    if (isMobile) {
      elements.shell.classList.toggle("mobile-nav-open", !collapsed);
    } else {
      state.collapsed = collapsed;
      elements.shell.classList.toggle("sidebar-collapsed", collapsed);
      saveState();
    }
    elements.sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
    elements.sidebarToggle.setAttribute("aria-label", collapsed ? "Expand navigation" : "Collapse navigation");
  }

  function moduleLabel(module) {
    const standard = { command: "Command Center", assistant: "AI Assistant" };
    return standard[module] || industries[state.industry].modules[module] || "Workspace";
  }

  function singularLabel(label) {
    return label.replace(/ies$/i, "y").replace(/s$/i, "");
  }

  function renderNavigation() {
    const industry = industries[state.industry];
    const permitted = new Set(roleAccess[state.role]);
    document.querySelectorAll(".nav-item[data-module]").forEach((item) => {
      const module = item.dataset.module;
      item.hidden = !permitted.has(module);
      const label = item.querySelector(".nav-label");
      if (label && industry.modules[module]) label.textContent = industry.modules[module];
      item.classList.toggle("active", module === state.activeModule);
      if (module === state.activeModule) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    if (!permitted.has(state.activeModule)) state.activeModule = "command";
  }

  function renderDashboard() {
    const industry = industries[state.industry];
    document.querySelector("#hero-eyebrow").textContent = industry.eyebrow;
    document.querySelector("#dashboard-title").textContent = industry.title;
    document.querySelector("#hero-description").textContent = industry.description;
    industry.metrics.forEach(([label, value, detail, tone], index) => {
      const position = index + 1;
      document.querySelector(`#metric-label-${position}`).textContent = label;
      document.querySelector(`#metric-value-${position}`).textContent = value;
      const detailElement = document.querySelector(`#metric-detail-${position}`);
      detailElement.textContent = detail;
      detailElement.className = `metric-detail${tone ? ` ${tone}` : ""}`;
    });
    document.querySelector("#signal-list").innerHTML = industry.signals
      .map(
        ([score, title, detail, tag, tone]) => `
          <article class="signal-row">
            <span class="signal-rank ${escapeHtml(tone)}">${escapeHtml(score)}</span>
            <div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(detail)}</p></div>
            <span class="signal-tag">${escapeHtml(tag)}</span>
          </article>`,
      )
      .join("");
  }

  function recordsFor(module) {
    const industry = industries[state.industry];
    const fallbackModule = industry.recordNames[module] ? module : "leads";
    const baseRows = industry.recordNames[fallbackModule].map((name, index) => {
      const [status, statusClass] = statusPatterns[index % statusPatterns.length];
      return {
        name,
        context: contextPatterns[index % contextPatterns.length],
        status,
        statusClass,
        owner: ownerPatterns[index % ownerPatterns.length],
        next: nextStepPatterns[index % nextStepPatterns.length],
      };
    });
    return [...(state.addedRecords[`${state.industry}:${module}`] || []), ...baseRows];
  }

  function renderRecords() {
    const module = ["command", "assistant"].includes(state.activeModule) ? "leads" : state.activeModule;
    const label = moduleLabel(module);
    const canEdit = state.role !== "Member" || ["contacts", "leads"].includes(module);
    let rows = recordsFor(module);
    if (state.activeFilter === "attention") rows = rows.filter((row) => row.statusClass === "attention");
    if (state.activeFilter === "healthy") rows = rows.filter((row) => row.statusClass === "healthy");
    if (state.query) {
      const needle = state.query.toLowerCase();
      rows = rows.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(needle)));
    }
    document.querySelectorAll(".filter-pill").forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === state.activeFilter);
    });
    elements.recordsEyebrow.textContent = `${industries[state.industry].name} · synthetic workspace`;
    elements.recordsTitle.textContent = label;
    elements.recordsDescription.textContent = `Explore representative ${label.toLowerCase()} using demonstration data only.`;
    elements.recordAction.textContent = `Add synthetic ${singularLabel(label).toLowerCase()}`;
    elements.recordAction.hidden = !canEdit || module === "reports" || module === "settings";
    elements.recordCount.textContent = `${rows.length} synthetic ${rows.length === 1 ? "record" : "records"}`;
    elements.recordsHead.innerHTML = `
      <tr><th scope="col">${escapeHtml(label)}</th><th scope="col">Context</th><th scope="col">Status</th><th scope="col">Owner</th><th scope="col">Next step</th></tr>`;
    elements.recordsBody.innerHTML = rows.length
      ? rows
          .map(
            (row) => `
              <tr>
                <td><span class="record-name">${escapeHtml(row.name)}</span><span class="record-subtitle">Synthetic demo record</span></td>
                <td>${escapeHtml(row.context)}</td>
                <td><span class="record-status ${escapeHtml(row.statusClass)}">${escapeHtml(row.status)}</span></td>
                <td>${escapeHtml(row.owner)}</td>
                <td><button class="text-button row-action" type="button">${escapeHtml(row.next)} →</button></td>
              </tr>`,
          )
          .join("")
      : `<tr><td class="empty-state" colspan="5">No synthetic records match this view.</td></tr>`;
    elements.recordsBody.querySelectorAll(".row-action").forEach((button) => {
      button.addEventListener("click", () => showToast("Record preview opened locally. No real data was changed."));
    });
  }

  function renderWorkspaceIdentity() {
    const industry = industries[state.industry];
    elements.workspaceName.textContent = industry.shortName;
    elements.workspaceAvatar.textContent = industry.initials;
    elements.topbarWorkspace.textContent = industry.shortName;
    elements.roleSelect.value = state.role;
    elements.roleNote.textContent = roleMessages[state.role];
  }

  function navigate(module, options = {}) {
    const permitted = roleAccess[state.role];
    state.activeModule = permitted.includes(module) ? module : "command";
    saveState();
    renderNavigation();
    elements.dashboard.hidden = state.activeModule !== "command";
    elements.recordsView.hidden = ["command", "assistant"].includes(state.activeModule);
    elements.assistantView.hidden = state.activeModule !== "assistant";
    elements.topbarView.textContent = moduleLabel(state.activeModule);
    if (!elements.recordsView.hidden) renderRecords();
    if (state.activeModule === "assistant" && options.prompt) {
      elements.assistantInput.value = options.prompt;
      window.setTimeout(() => elements.assistantInput.focus(), 0);
    }
    window.location.hash = state.activeModule === "command" ? "command-center" : state.activeModule;
    if (window.matchMedia("(max-width: 760px)").matches) setSidebarState(true);
  }

  function renderAll() {
    renderWorkspaceIdentity();
    renderNavigation();
    renderDashboard();
    setSidebarState(window.matchMedia("(max-width: 760px)").matches ? true : state.collapsed);
    navigate(state.activeModule);
  }

  function addSyntheticRecord() {
    const module = state.activeModule;
    const key = `${state.industry}:${module}`;
    const label = singularLabel(moduleLabel(module));
    const entry = {
      name: `New synthetic ${label.toLowerCase()}`,
      context: "Created in this browser just now",
      status: "Review",
      statusClass: "neutral",
      owner: state.role === "Member" ? "Assigned member" : "Valerian Sandbox",
      next: "Review details",
    };
    state.addedRecords[key] = [entry, ...(state.addedRecords[key] || [])];
    saveState();
    renderRecords();
    showToast(`${label} added to this browser-only sandbox.`);
  }

  function assistantResponse(prompt) {
    const industry = industries[state.industry];
    const normalized = prompt.toLowerCase();
    if (normalized.includes("missing") || normalized.includes("next step")) {
      return `I found three ${industry.modules.leads.toLowerCase()} without a clear next step. In the full product I would prepare a reviewable action plan before changing anything.`;
    }
    if (normalized.includes("priority") || normalized.includes("today")) {
      return `Today’s synthetic priority is to resolve the ${industry.signals[2][1].toLowerCase()}, then review ${industry.signals[0][1].toLowerCase()}. No action has been executed.`;
    }
    if (normalized.includes("lead") || normalized.includes("intent") || normalized.includes("prospect")) {
      return `${industry.signals[0][1]} is the strongest current signal at ${industry.signals[0][0]}. I would verify recent activity and ownership before proposing outreach.`;
    }
    return `I can summarize ${industry.modules.leads.toLowerCase()}, identify follow-up gaps, or prepare a bounded plan for ${industry.name}. This is a deterministic sandbox response.`;
  }

  function appendMessage(role, text) {
    const article = document.createElement("article");
    article.className = `chat-message ${role === "user" ? "user-message" : "assistant-message"}`;
    const author = document.createElement("span");
    author.className = "message-author";
    author.textContent = role === "user" ? "You" : "Valerian Assistant";
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    article.append(author, paragraph);
    elements.chatThread.append(article);
    elements.chatThread.scrollTop = elements.chatThread.scrollHeight;
  }

  function submitAssistant(prompt) {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;
    appendMessage("user", cleanPrompt);
    elements.assistantInput.value = "";
    window.setTimeout(() => appendMessage("assistant", assistantResponse(cleanPrompt)), 320);
  }

  elements.sidebarToggle.addEventListener("click", () => {
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const collapsed = isMobile
      ? elements.shell.classList.contains("mobile-nav-open")
      : !elements.shell.classList.contains("sidebar-collapsed");
    setSidebarState(collapsed);
  });
  elements.mobileMenu.addEventListener("click", () => setSidebarState(false));
  elements.roleSelect.addEventListener("change", () => {
    state.role = elements.roleSelect.value;
    if (!roleAccess[state.role].includes(state.activeModule)) state.activeModule = "command";
    saveState();
    renderAll();
    showToast(`Preview switched to ${state.role}. Navigation now reflects this role.`);
  });
  elements.workspaceSwitcher.addEventListener("click", () => elements.workspaceDialog.showModal());
  document.querySelectorAll("[data-industry]").forEach((button) => {
    button.addEventListener("click", () => {
      state.industry = button.dataset.industry;
      state.activeModule = "command";
      state.activeFilter = "all";
      state.query = "";
      saveState();
      elements.workspaceDialog.close();
      renderAll();
      showToast(`${industries[state.industry].name} template loaded with synthetic data.`);
    });
  });
  document.querySelectorAll(".nav-item[data-module]").forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(item.dataset.module);
    });
  });
  document.querySelector("#review-signals").addEventListener("click", () => {
    document.querySelector("#signal-feed").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  document.querySelector("#view-all-signals").addEventListener("click", () => navigate("leads"));
  document.querySelector("#reset-demo").addEventListener("click", () => {
    window.localStorage.removeItem(STORAGE_KEY);
    state = { ...defaultState, addedRecords: {} };
    elements.globalSearch.value = "";
    renderAll();
    showToast("Synthetic workspace reset to its original state.");
  });
  document.querySelector("#brief-prompt").addEventListener("click", () => navigate("assistant", { prompt: "Draft today’s priority plan" }));
  elements.globalSearch.addEventListener("input", () => {
    state.query = elements.globalSearch.value.trim();
    if (!elements.recordsView.hidden) renderRecords();
  });
  elements.globalSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && elements.dashboard.hidden === false && elements.globalSearch.value.trim()) {
      state.query = elements.globalSearch.value.trim();
      navigate("leads");
    }
  });
  document.querySelectorAll(".filter-pill").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeFilter = button.dataset.filter;
      document.querySelectorAll(".filter-pill").forEach((candidate) => candidate.classList.toggle("active", candidate === button));
      renderRecords();
    });
  });
  elements.recordAction.addEventListener("click", addSyntheticRecord);
  document.querySelector("#assistant-form").addEventListener("submit", (event) => {
    event.preventDefault();
    submitAssistant(elements.assistantInput.value);
  });
  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => submitAssistant(button.dataset.prompt));
  });
  document.querySelector("#demo-file").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    elements.attachmentName.textContent = file ? `${file.name} · browser only` : "";
    if (file) showToast("File selected locally. This static sandbox does not upload it.");
  });
  document.querySelector("#new-conversation").addEventListener("click", () => {
    elements.chatThread.innerHTML = `
      <article class="chat-message assistant-message">
        <span class="message-author">Valerian Assistant</span>
        <p>New synthetic conversation started. What would you like to explore?</p>
      </article>`;
    elements.assistantInput.focus();
  });
  document.querySelectorAll(".conversation-item").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".conversation-item").forEach((item) => item.classList.toggle("active", item === button));
      showToast(`Opened “${button.firstChild.textContent.trim()}” in this demo.`);
    });
  });
  document.querySelector(".sign-out").addEventListener("click", () => showToast("This public preview has no signed-in session to end."));
  window.addEventListener("resize", () => {
    if (!window.matchMedia("(max-width: 760px)").matches) {
      elements.shell.classList.remove("mobile-nav-open");
      setSidebarState(state.collapsed);
    }
  });

  renderAll();
})();
