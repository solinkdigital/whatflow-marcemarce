(() => {
  "use strict";
  const CONFIG_URL = "./config/companies/marcemarce.json";
  const $ = (selector) => document.querySelector(selector);
  const state = { step: 0, answers: {} };
  const steps = [
    { title: "O que pretende produzir?", description: "Escolha a opção que melhor representa o seu projecto.", fields: ["category"] },
    { title: "Conte-nos sobre o projecto", description: "Quanto mais contexto partilhar, mais fácil será orientar o próximo passo.", fields: ["description", "quantity", "hasReference", "measurements"] },
    { title: "Onde será realizado?", description: "A MarceMarce atende projectos em Angola. A cobertura e a logística serão confirmadas pela equipa.", fields: ["province", "municipality", "neighbourhood", "needsMeasurement"] },
    { title: "Qual é o seu objectivo?", description: "Os preços são personalizados e o prazo depende das características do projecto.", fields: ["intent", "timeline", "budget"] },
    { title: "Como podemos contactá-lo?", description: "Preencha os dados para preparar o seu pedido.", fields: ["name", "customerType", "businessName", "alternatePhone", "privacy"] }
  ];
  let company;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    }[char]));
  }
  function value(name) { return state.answers[name] ?? ""; }
  function set(name, val) { state.answers[name] = val; }
  function field(label, name, control, required = false, hint = "") {
    return `<div class="field"><label class="field-label" for="${name}">${label}${required ? ' <span class="required">*</span>' : ""}</label>${control}${hint ? `<small class="field-hint">${hint}</small>` : ""}</div>`;
  }
  function input(label, name, placeholder, required = false, type = "text", hint = "") {
    return field(label, name, `<input class="text-input" id="${name}" name="${name}" type="${type}" value="${escapeHtml(value(name))}" placeholder="${escapeHtml(placeholder)}" ${required ? "required" : ""} ${type === "number" ? 'min="1" step="1"' : ""}>`, required, hint);
  }
  function textarea(label, name, placeholder, required = false, hint = "") {
    return field(label, name, `<textarea class="textarea-input" id="${name}" name="${name}" placeholder="${escapeHtml(placeholder)}" ${required ? "required" : ""}>${escapeHtml(value(name))}</textarea>`, required, hint);
  }
  function choices(label, name, options, required = false, hint = "") {
    const html = options.map((option) => {
      const item = typeof option === "string" ? {value:option,label:option} : option;
      // A configuração usa "id"; aceitar também "value" mantém compatibilidade
      // e evita que opções de rádio recebam um valor inválido.
      const optionValue = String(item.value ?? item.id ?? item.label ?? "");
      return `<label class="choice"><input type="radio" name="${name}" value="${escapeHtml(optionValue)}" ${value(name) === optionValue ? "checked" : ""} ${required ? "required" : ""}><span class="choice-text">${escapeHtml(item.label ?? optionValue)}${item.detail ? `<small>${escapeHtml(item.detail)}</small>` : ""}</span></label>`;
    }).join("");
    return field(label, name, `<div class="choice-list">${html}</div>`, required, hint);
  }
  function select(label, name, options, placeholder, required = false) {
    return field(label, name, `<select class="select-input" id="${name}" name="${name}" ${required ? "required" : ""}><option value="">${escapeHtml(placeholder)}</option>${options.map(o => `<option value="${escapeHtml(o)}" ${value(name) === o ? "selected" : ""}>${escapeHtml(o)}</option>`).join("")}</select>`, required);
  }
  function renderStep() {
    const step = steps[state.step];
    $("#step-count").textContent = `Etapa ${state.step + 1} de ${steps.length}`;
    $("#progress-percent").textContent = `${Math.round(((state.step + 1) / steps.length) * 100)}%`;
    $("#progress-bar").style.width = `${((state.step + 1) / steps.length) * 100}%`;
    $("#back-button").hidden = state.step === 0;
    $("#next-button").hidden = state.step === steps.length - 1;
    $("#submit-button").hidden = state.step !== steps.length - 1;
    $("#error-message").hidden = true;

    let content = `<p class="step-kicker">Etapa ${state.step + 1}</p><h2 class="step-title" id="step-title">${step.title}</h2><p class="step-description">${step.description}</p>`;
    if (state.step === 0) {
      content += choices("Tipo de projecto", "category", company.services, true);
    } else if (state.step === 1) {
      content += textarea("Descreva o móvel ou projecto", "description", "Ex.: cozinha em L, roupeiro para quarto...", value("category") !== "explorar", "Se ainda está a explorar, pode deixar em branco.");
      content += input("Quantidade aproximada de unidades", "quantity", "Ex.: 1 cozinha ou 3 roupeiros", value("category") !== "explorar");
      content += choices("Tem fotografia, desenho ou referência?", "hasReference", [
        {value:"sim",label:"Sim, tenho referência"},
        {value:"nao",label:"Ainda não tenho"}
      ], false);
      content += input("Medidas aproximadas (opcional)", "measurements", "Ex.: 2,4 m × 1,8 m", false, "text", "Não tem medidas? A equipa pode avaliar a necessidade de medição.");
    } else if (state.step === 2) {
      content += select("Província", "province", ["Bengo","Benguela","Bié","Cabinda","Cuando","Cubango","Cuanza Norte","Cuanza Sul","Cunene","Huambo","Huíla","Ícolo e Bengo","Luanda","Lunda Norte","Lunda Sul","Malanje","Moxico","Moxico Leste","Namibe","Uíge","Zaire"], "Seleccione a província", true);
      content += input("Município", "municipality", "Indique o município", true);
      content += input("Bairro ou zona", "neighbourhood", "Indique o bairro ou zona", true);
      content += choices("Precisa de medição no local?", "needsMeasurement", [
        {value:"sim",label:"Sim, pretendo agendar uma medição"},
        {value:"nao",label:"Não, já tenho as medidas"},
        {value:"naosei",label:"Preciso de orientação"}
      ], true);
      if (value("needsMeasurement") === "sim") content += input("Período preferido para contacto/agendamento", "measurementTime", "Ex.: durante a próxima semana", false);
    } else if (state.step === 3) {
      content += choices("O que pretende neste momento?", "intent", [
        {value:"informacao",label:"Conhecer os serviços e possibilidades"},
        {value:"estimativa",label:"Ter uma estimativa inicial"},
        {value:"orcamento",label:"Solicitar orçamento formal"}
      ], true);
      content += choices("Quando pretende iniciar?", "timeline", [
        {value:"urgente",label:"O mais breve possível"},
        {value:"30dias",label:"Dentro de 30 dias"},
        {value:"1a3meses",label:"Dentro de 1 a 3 meses"},
        {value:"flexivel",label:"Ainda sem data definida"}
      ], value("intent") === "orcamento");
      content += choices("Tem um orçamento previsto?", "budget", [
        {value:"definido",label:"Sim, tenho um valor previsto"},
        {value:"naodefinido",label:"Ainda não defini"},
        {value:"orientacao",label:"Preciso de orientação sobre custos"}
      ], false);
      if (value("budget") === "definido") content += input("Valor aproximado em Kz", "budgetAmount", "Ex.: 250000", true, "number");
    } else if (state.step === 4) {
      content += input("Nome", "name", "O seu nome", true);
      content += choices("Está a solicitar como", "customerType", [
        {value:"Particular",label:"Particular"},
        {value:"Empresa",label:"Empresa"}
      ], true);
      if (value("customerType") === "Empresa") content += input("Nome da empresa", "businessName", "Nome comercial", true);
      content += input("Contacto alternativo (opcional)", "alternatePhone", "+244 ...", false, "tel", "Se não preencher, o atendente poderá responder nesta conversa WhatsApp.");
      content += `<div class="field"><label class="choice"><input type="checkbox" id="privacy" name="privacy" ${value("privacy") === "sim" ? "checked" : ""}><span class="choice-text">Li a nota de privacidade e aceito que estes dados sejam usados para responder ao meu pedido. <span class="required">*</span></span></label></div>`;
    }
    $("#step-content").innerHTML = content;
    $("#step-content").querySelectorAll("input,textarea,select").forEach(el => {
      el.addEventListener("change", () => {
        if (el.type === "radio") {
          if (el.checked) set(el.name, el.value);
        } else if (el.type === "checkbox") {
          set(el.name, el.checked ? "sim" : "");
        } else {
          set(el.name, el.value.trim());
        }
        if (["category","intent","budget","needsMeasurement","customerType"].includes(el.name)) {
          collectVisible();
          renderStep();
        }
      });
      if (!["radio","checkbox"].includes(el.type)) {
        el.addEventListener("input", () => set(el.name, el.value));
      }
    });
    if (state.step === steps.length - 1) {
      const privacy = $("#privacy");
      if (privacy) privacy.addEventListener("change", () => set("privacy", privacy.checked ? "sim" : ""));
    }
  }
  function validateStep() {
    const fields = steps[state.step].fields;
    let missing = [];
    if (state.step === 0 && !value("category")) missing.push("tipo de projecto");
    if (state.step === 1 && value("category") !== "explorar") {
      if (!value("description")) missing.push("descrição do projecto");
      if (!value("quantity")) missing.push("quantidade aproximada");
    }
    if (state.step === 2 && (!value("province") || !value("municipality") || !value("neighbourhood") || !value("needsMeasurement"))) missing.push("localização e necessidade de medição");
    if (state.step === 3) {
      if (!value("intent")) missing.push("objectivo do pedido");
      if (value("intent") === "orcamento" && !value("timeline")) missing.push("prazo pretendido");
      if (value("budget") === "definido" && !value("budgetAmount")) missing.push("valor aproximado do orçamento");
    }
    if (state.step === 4) {
      if (!value("name")) missing.push("nome");
      if (!value("customerType")) missing.push("perfil do cliente");
      if (value("customerType") === "Empresa" && !value("businessName")) missing.push("nome da empresa");
      if (value("privacy") !== "sim") missing.push("confirmação da nota de privacidade");
    }
    if (missing.length) {
      $("#error-message").textContent = `Para continuar, indique: ${missing.join(", ")}.`;
      $("#error-message").hidden = false;
      return false;
    }
    return true;
  }
  function qualification() {
    let score = 0;
    if (value("intent") === "orcamento") score += 20;
    else if (value("intent") === "estimativa") score += 12;
    if (value("category") && value("category") !== "explorar") score += 20;
    if (value("timeline") && value("timeline") !== "flexivel") score += 15;
    if (value("province") && value("municipality") && value("neighbourhood")) score += 10;
    if (value("description") || value("quantity") || value("measurements") || value("hasReference") === "sim") score += 15;
    if (value("name") && value("customerType")) score += 10;
    if (value("budget") === "definido" && value("budgetAmount")) score += 10;
    const level = score >= 70 ? "A — Pedido prioritário" : score >= 40 ? "B — Pedido em desenvolvimento" : "C — Consulta inicial";
    return {score,level};
  }
  function labelFor(key, val) {
    const maps = {
      category: Object.fromEntries(company.services.map(s => [s.value || s.id, s.label])),
      hasReference: {sim:"Sim",nao:"Não"},
      needsMeasurement: {sim:"Sim, pretende agendar",nao:"Não, já tem medidas",naosei:"Precisa de orientação"},
      intent: {informacao:"Conhecer serviços",estimativa:"Estimativa inicial",orcamento:"Orçamento formal"},
      timeline: {urgente:"O mais breve possível", "30dias":"Dentro de 30 dias","1a3meses":"Dentro de 1 a 3 meses",flexivel:"Sem data definida"},
      budget: {definido:"Tem valor previsto",naodefinido:"Ainda não definido",orientacao:"Precisa de orientação"}
    };
    return maps[key]?.[val] || val || "Por definir";
  }
  function messageText() {
    const q = qualification();
    const rows = [
      "🪚 MARCEMARCE INTERIORES",
      "NOVO PEDIDO VIA WHAT'FLOW",
      "",
      "👤 CLIENTE",
      `Nome: ${value("name")}`,
      `Perfil: ${value("customerType")}`,
      value("businessName") ? `Empresa: ${value("businessName")}` : "",
      value("alternatePhone") ? `Contacto alternativo: ${value("alternatePhone")}` : "",
      "",
      "📐 PROJECTO",
      `Categoria: ${labelFor("category",value("category"))}`,
      value("description") ? `Descrição: ${value("description")}` : "",
      value("quantity") ? `Quantidade: ${value("quantity")}` : "",
      `Medidas: ${value("measurements") || "Por definir"}`,
      `Referência visual: ${labelFor("hasReference",value("hasReference") || "nao")}`,
      "",
      "📍 LOCALIZAÇÃO",
      `Província: ${value("province")}`,
      `Município: ${value("municipality")}`,
      `Bairro/zona: ${value("neighbourhood")}`,
      "",
      "📏 MEDIÇÃO",
      `Pedido: ${labelFor("needsMeasurement",value("needsMeasurement"))}`,
      value("measurementTime") ? `Período preferido: ${value("measurementTime")}` : "",
      "",
      "💰 ORÇAMENTO E PRAZO",
      `Objectivo: ${labelFor("intent",value("intent"))}`,
      `Prazo: ${labelFor("timeline",value("timeline") || "flexivel")}`,
      `Orçamento: ${value("budget") === "definido" ? `${value("budgetAmount")} Kz` : labelFor("budget",value("budget") || "naodefinido")}`,
      "",
      "🎯 TRIAGEM INTERNA",
      `Prioridade sugerida: ${q.level}`,
      `Pontuação: ${q.score}/100`,
      "",
      "Pretendo receber orientação sobre os próximos passos do meu projecto.",
      "Origem: What'flow"
    ];
    return rows.filter((line, index) => line !== "" || (index > 0 && rows[index-1] !== "")).join("\n");
  }
  function renderReview() {
    const q = qualification();
    const pairs = [
      ["Cliente",value("name")],
      ["Perfil",value("customerType")],
      ["Projecto",labelFor("category",value("category"))],
      ["Descrição",value("description") || "Por definir"],
      ["Quantidade",value("quantity") || "Por definir"],
      ["Localização",[value("neighbourhood"),value("municipality"),value("province")].filter(Boolean).join(", ")],
      ["Medição",labelFor("needsMeasurement",value("needsMeasurement"))],
      ["Objectivo",labelFor("intent",value("intent"))],
      ["Prazo",labelFor("timeline",value("timeline") || "flexivel")]
    ];
    $("#step-content").innerHTML = `<p class="step-kicker">Revisão final</p><h2 class="step-title" id="step-title">Confirme o seu pedido.</h2><p class="step-description">Veja se os dados estão correctos. A mensagem abrirá no WhatsApp para poder rever e enviar.</p><div class="summary-list">${pairs.map(([k,v])=>`<div class="summary-row"><span class="summary-key">${escapeHtml(k)}</span><span class="summary-value">${escapeHtml(v)}</span></div>`).join("")}</div><p class="review-note">Depois de abrir o WhatsApp, poderá anexar fotografias ou desenhos do projecto. A prioridade é uma sugestão automática para a equipa, não uma garantia de preço ou prazo.</p>`;
    $("#step-count").textContent = "Revisão final";
    $("#progress-percent").textContent = "100%";
    $("#progress-bar").style.width = "100%";
    $("#back-button").hidden = false;
    $("#next-button").hidden = true;
    $("#submit-button").hidden = false;
    $("#submit-button").textContent = "Abrir WhatsApp ↗";
  }
  function collectVisible() {
    $("#step-content").querySelectorAll("input,textarea,select").forEach(el => {
      if (el.type === "radio" && el.checked) set(el.name,el.value);
      else if (el.type === "checkbox") set(el.name,el.checked ? "sim" : "");
      else if (!["radio","checkbox"].includes(el.type)) set(el.name,el.value.trim());
    });
  }
  async function init() {
    try {
      const response = await fetch(CONFIG_URL);
      if (!response.ok) throw new Error("Não foi possível carregar a configuração.");
      company = await response.json();
    } catch (error) {
      $("#step-content").innerHTML = `<h2 class="step-title">Não foi possível iniciar.</h2><p class="step-description">Abra o projecto através do Live Server ou publique-o no GitHub Pages. A configuração da empresa não foi carregada.</p>`;
      $("#next-button").disabled = true;
      return;
    }
    $("#company-location").textContent = company.locationLabel.toUpperCase();
    $("#footer-company").textContent = company.name;
    $("#footer-hours").textContent = company.hours;
    renderStep();
  }
  $("#next-button").addEventListener("click", () => {
    collectVisible();
    if (!validateStep()) return;
    state.step = Math.min(state.step + 1, steps.length - 1);
    renderStep();
  });
  $("#back-button").addEventListener("click", () => {
    if ($("#step-count").textContent === "Revisão final") {
      renderStep();
      return;
    }
    collectVisible();
    state.step = Math.max(state.step - 1, 0);
    renderStep();
  });
  $("#intake-form").addEventListener("submit", (event) => {
    event.preventDefault();
    collectVisible();
    if ($("#step-count").textContent !== "Revisão final") {
      if (!validateStep()) return;
      renderReview();
      return;
    }
    const phone = String(company.whatsapp).replace(/\D/g,"");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(messageText())}`;
    window.location.href = url;
  });
  init();
})();
