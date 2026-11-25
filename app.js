// ==================== КОНФИГУРАЦИЯ TELEGRAM-БОТА ====================
const TELEGRAM_CONFIG = {
    BOT_TOKEN: "8946135508:AAHo-oqIX3EGDfQfb46_WuAf0r014Qm54Og", // Получить у @BotFather
    CHAT_ID: "8629791685"     // Ваш личный ID или ID чата администраторов
};

document.addEventListener("DOMContentLoaded", () => {
    initPreloader();
    initVisualEffects();
    renderSpaces();
    renderEvents("all");
    renderMenuFilters();
    renderMenu("Все");
    renderCases();
    renderTeam();
    renderReviews();
    renderFaq();
    renderHallMap();
    initBanquetCalculator();
    initBookingAndUtilityPages();
});

/* ==================== 1. ВСТУПИТЕЛЬНАЯ АНИМАЦИЯ ==================== */
function initPreloader() {
    const preloader = document.getElementById("preloader");
    const skipBtn = document.getElementById("skipIntroBtn");
    const replayBtn = document.getElementById("replayIntroBtn");
    const canvas = document.getElementById("preloaderCanvas");
    const ctx = canvas.getContext("2d");

    let animFrame;
    let hideTimer;
    const particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    for (let i = 0; i < 65; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2.4 + 0.6,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -Math.random() * 0.7 - 0.2,
            gold: Math.random() > 0.35
        });
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < 0) p.y = canvas.height;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.gold ? "rgba(217, 164, 91, 0.65)" : "rgba(232, 41, 66, 0.55)";
            ctx.fill();
        });
        animFrame = requestAnimationFrame(drawParticles);
    }
    drawParticles();

    function hidePreloader() {
        preloader.classList.add("hidden");
        preloader.setAttribute("aria-hidden", "true");
        clearTimeout(hideTimer);
        cancelAnimationFrame(animFrame);
    }

    hideTimer = setTimeout(hidePreloader, 3100);
    skipBtn.addEventListener("click", hidePreloader);

    replayBtn.addEventListener("click", () => {
        preloader.classList.remove("hidden");
        preloader.setAttribute("aria-hidden", "false");
        drawParticles();
        hideTimer = setTimeout(hidePreloader, 3000);
    });
}

/* ==================== 2. СКРОЛЛ, КУРСОР И СЧЁТЧИКИ ==================== */
function initVisualEffects() {
    const progress = document.getElementById("scrollProgress");
    const cursorGlow = document.getElementById("cursorGlow");
    const burgerBtn = document.getElementById("burgerBtn");
    const mainNav = document.getElementById("mainNav");

    burgerBtn.addEventListener("click", () => mainNav.classList.toggle("open"));

    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = `${docHeight > 0 ? (scrollTop / docHeight) * 100 : 0}%`;
    });

    window.addEventListener("mousemove", (e) => {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
    });

    document.addEventListener("mousemove", (e) => {
        const card = e.target.closest(".spotlight-card");
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    entry.target.querySelectorAll("[data-target]").forEach(animateCounter);
                }
            });
        },
        { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function animateCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const target = Number(el.dataset.target);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 35));
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            el.textContent = target;
            clearInterval(timer);
        } else {
            el.textContent = current;
        }
    }, 28);
}

/* ==================== 3. РЕНДЕР ЗАЛОВ И АФИШИ ==================== */
function renderSpaces() {
    document.getElementById("spacesGrid").innerHTML = IMPERIA_DATA.spaces
        .map(
            (s) => `
      <article class="glass-panel spotlight-card space-card">
        <div>
          <div class="space-header">
            <h3>${s.title}</h3>
            <span class="tag-crimson">${s.badge}</span>
          </div>
          <p class="menu-desc" style="margin: 12px 0 18px;">${s.description}</p>
          <ul class="space-features">
            ${s.features.map((f) => `<li>${f}</li>`).join("")}
          </ul>
        </div>
        <button type="button" class="btn-outline" data-open-booking="${s.zone}">Забронировать стол в зоне</button>
      </article>
    `
        )
        .join("");
}

function renderEvents(filter) {
    const list = filter === "all" ? IMPERIA_DATA.events : IMPERIA_DATA.events.filter((e) => e.category === filter);
    document.getElementById("eventsGrid").innerHTML = list
        .map(
            (ev) => `
      <article class="glass-panel spotlight-card event-card">
        <div>
          <div class="card-top-meta">
            <span class="event-date-badge">${ev.date}</span>
            <span class="tag-gold">${ev.tag}</span>
          </div>
          <h3>${ev.title}</h3>
          <p class="menu-desc">${ev.desc}</p>
        </div>
        <div>
          <div class="event-meta">
            <span>${ev.hall}</span>
            <strong>${ev.entry}</strong>
          </div>
          <button type="button" class="btn-primary w-full" style="margin-top: 14px;" data-open-booking="${ev.hall} (${ev.title})">
            Оставить заявку на вечер
          </button>
        </div>
      </article>
    `
        )
        .join("");
}

document.getElementById("eventFilters").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-event-filter]");
    if (!btn) return;
    document.querySelectorAll("#eventFilters .pill").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    renderEvents(btn.dataset.eventFilter);
});

/* ==================== 4. МЕНЮ И ПРЕДЗАКАЗ ==================== */
const preorderItems = [];

function renderMenuFilters() {
    const box = document.getElementById("menuFilters");
    box.innerHTML = IMPERIA_DATA.menuCategories
        .map((cat, idx) => `<button type="button" class="pill ${idx === 0 ? "active" : ""}" data-menu-cat="${cat}">${cat}</button>`)
        .join("");

    box.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-menu-cat]");
        if (!btn) return;
        box.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        renderMenu(btn.dataset.menuCat);
    });
}

function renderMenu(category) {
    const list = category === "Все" ? IMPERIA_DATA.menu : IMPERIA_DATA.menu.filter((m) => m.category === category);
    document.getElementById("menuGrid").innerHTML = list
        .map(
            (item) => `
      <article class="glass-panel spotlight-card menu-card">
        <div>
          <div class="menu-card-top">
            <h4>${item.name}</h4>
            <span class="menu-weight">${item.weight}</span>
          </div>
          <p class="menu-desc" style="margin-top: 8px;">${item.desc}</p>
        </div>
        <div class="menu-card-footer">
          <span class="menu-price">${item.price.toLocaleString("ru-RU")} ₽</span>
          <button type="button" class="btn-outline btn-sm" data-add-dish="${item.name}" data-dish-price="${item.price}">
            + К столу
          </button>
        </div>
      </article>
    `
        )
        .join("");
}

document.getElementById("menuGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-dish]");
    if (!btn) return;
    preorderItems.push({ name: btn.dataset.addDish, price: Number(btn.dataset.dishPrice) });
    updatePreorderBar();
});

function updatePreorderBar() {
    const bar = document.getElementById("preorderBar");
    if (preorderItems.length === 0) {
        bar.hidden = true;
        return;
    }
    const total = preorderItems.reduce((acc, i) => acc + i.price, 0);
    bar.hidden = false;
    document.getElementById("preorderCount").textContent = `Выбрано блюд к столу: ${preorderItems.length}`;
    document.getElementById("preorderSum").textContent = `Предзаказ: ${total.toLocaleString("ru-RU")} ₽`;
}

document.getElementById("clearPreorderBtn").addEventListener("click", () => {
    preorderItems.length = 0;
    updatePreorderBar();
});

document.getElementById("applyPreorderBtn").addEventListener("click", () => {
    const total = preorderItems.reduce((acc, i) => acc + i.price, 0);
    document.getElementById("bookingComment").value =
        `Предзаказ блюд (${total.toLocaleString("ru-RU")} ₽): ${preorderItems.map((i) => i.name).join(", ")}`;
});

/* ==================== 5. КЕЙСЫ, КОМАНДА, ОТЗЫВЫ И FAQ ==================== */
function renderCases() {
    document.getElementById("casesGrid").innerHTML = IMPERIA_DATA.cases
        .map(
            (c) => `
      <article class="glass-panel spotlight-card case-card">
        <div>
          <span class="tag-crimson">${c.tag}</span>
          <h3 style="margin-top: 12px;">${c.title}</h3>
          <p class="menu-desc">${c.desc}</p>
        </div>
        <div class="case-stats">
          <div><small>Масштаб</small><strong>${c.guests}</strong></div>
          <div><small>Бюджет события</small><strong>${c.budget}</strong></div>
        </div>
      </article>
    `
        )
        .join("");
}

function renderTeam() {
    document.getElementById("teamGrid").innerHTML = IMPERIA_DATA.team
        .map(
            (member) => `
      <figure class="glass-panel spotlight-card team-card">
        <div class="team-photo-frame" role="img" aria-label="${member.name} — ${member.role} развлекательного комплекса Империя">
          <div class="team-avatar-initials">${member.initials}</div>
          <span class="team-photo-hint">Место под фото: ${member.name}</span>
        </div>
        <figcaption class="team-caption">
          <strong>${member.name}</strong>
          <span class="team-role">${member.role}</span>
          <p class="menu-desc">${member.caption}</p>
        </figcaption>
      </figure>
    `
        )
        .join("");
}

function renderReviews() {
    document.getElementById("reviewsGrid").innerHTML = IMPERIA_DATA.reviews
        .map(
            (r) => `
      <article class="glass-panel spotlight-card review-card">
        <div>
          <div class="review-stars" aria-label="Оценка 5 из 5">★★★★★</div>
          <p class="menu-desc" style="margin-top: 12px; color: var(--text-main);">«${r.text}»</p>
        </div>
        <div class="review-author">
          <strong>${r.author}</strong>
          <span class="meta-muted">${r.source}</span>
        </div>
      </article>
    `
        )
        .join("");
}

function renderFaq() {
    const listEl = document.getElementById("faqList");
    listEl.innerHTML = IMPERIA_DATA.faqs
        .map(
            (item, i) => `
      <div class="faq-item ${i === 0 ? "open" : ""}">
        <button type="button" class="faq-question" aria-expanded="${i === 0}">
          <span>${i + 1}. ${item.q}</span>
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-answer">${item.a}</div>
      </div>
    `
        )
        .join("");

    listEl.addEventListener("click", (e) => {
        const btn = e.target.closest(".faq-question");
        if (!btn) return;
        const parent = btn.closest(".faq-item");
        const isOpen = parent.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(isOpen));
    });
}

/* ==================== 6. СХЕМА ЗАЛА И КАЛЬКУЛЯТОР БАНКЕТОВ ==================== */
let selectedTableId = null;

function renderHallMap() {
    document.getElementById("hallTablesGroup").innerHTML = IMPERIA_DATA.tables
        .map((t) => {
            const isSelected = t.id === selectedTableId;
            const fill = t.status === "busy" ? "#3b2c30" : isSelected ? "#e82942" : "#1d3d2f";
            const stroke = t.status === "busy" ? "#665559" : isSelected ? "#fff" : "#2ec27e";
            return `
        <g class="table-node ${t.status}" data-table-id="${t.id}" transform="translate(${t.x}, ${t.y})">
          <rect x="-46" y="-26" width="92" height="52" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8" />
          <text x="0" y="-3" text-anchor="middle" fill="#F4EFEA" font-size="13" font-weight="700">${t.label}</text>
          <text x="0" y="14" text-anchor="middle" fill="#D9A45B" font-size="10">${t.seats} мест · ${t.deposit / 1000}к ₽</text>
        </g>
      `;
        })
        .join("");
}

document.getElementById("hallSvg").addEventListener("click", (e) => {
    const node = e.target.closest("[data-table-id]");
    if (!node) return;
    const table = IMPERIA_DATA.tables.find((t) => t.id === node.dataset.tableId);
    if (!table || table.status === "busy") return;

    selectedTableId = table.id;
    renderHallMap();
    document.getElementById("selectedTableBanner").innerHTML = `
    Выбран: <strong>${table.label} (${table.zone})</strong> · до ${table.seats} гостей · депозит ${table.deposit.toLocaleString("ru-RU")} ₽
  `;
    document.getElementById("hallZoneSelect").value = table.zone;
});

function initBanquetCalculator() {
    const range = document.getElementById("banquetGuestsRange");
    const guestsVal = document.getElementById("banquetGuestsVal");
    const tierBtns = document.querySelectorAll(".tier-btn");
    const addons = document.querySelectorAll(".banquet-addon");

    let guests = Number(range.value);
    let pricePerGuest = 3200;

    function recalc() {
        const menuCost = guests * pricePerGuest;
        let addonsCost = 0;
        addons.forEach((cb) => { if (cb.checked) addonsCost += Number(cb.value); });
        const total = menuCost + addonsCost;

        guestsVal.textContent = `${guests} гостей`;
        document.getElementById("sumMenuCost").textContent = `${menuCost.toLocaleString("ru-RU")} ₽`;
        document.getElementById("sumAddonsCost").textContent = `${addonsCost.toLocaleString("ru-RU")} ₽`;
        document.getElementById("sumTotalCost").textContent = `${total.toLocaleString("ru-RU")} ₽`;
    }

    range.addEventListener("input", () => { guests = Number(range.value); recalc(); });
    tierBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            tierBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            pricePerGuest = Number(btn.dataset.price);
            recalc();
        });
    });
    addons.forEach((cb) => cb.addEventListener("change", recalc));
    recalc();

    document.getElementById("bookBanquetBtn").addEventListener("click", () => {
        const totalText = document.getElementById("sumTotalCost").textContent;
        document.getElementById("bookingComment").value = `Запрос на банкет: ${guests} гостей, расчётная смета ${totalText}`;
        document.getElementById("hall-map").scrollIntoView({ behavior: "smooth" });
    });
}

/* ==================== 7. ОТПРАВКА ЗАЯВОК В TELEGRAM И СТРАНИЦЫ ==================== */
async function sendLeadToTelegram(payload) {
    const { BOT_TOKEN, CHAT_ID } = TELEGRAM_CONFIG;

    // Защита на случай, если токен ещё не подставлен при локальном тесте
    if (!BOT_TOKEN || BOT_TOKEN === "ВАШ_ТОКЕН_БОТА" || !CHAT_ID || CHAT_ID === "ВАШ_CHAT_ID") {
        console.warn("Telegram BOT_TOKEN или CHAT_ID не заданы в TELEGRAM_CONFIG. Заявка:", payload);
        return;
    }

    const lines = [
        "<b>Новая заявка с сайта ИМПЕРИЯ</b>",
        "",
        `<b>Гость:</b> ${escapeHtml(payload.name)}`,
        `<b>Телефон:</b> ${escapeHtml(payload.phone)}`,
        `<b>Зона:</b> ${escapeHtml(payload.zone)}`,
        `<b>Выбранный стол:</b> ${escapeHtml(payload.table)}`,
        `<b>Дата и время:</b> ${escapeHtml(payload.date)} в ${escapeHtml(payload.time)}`,
        `<b>Количество гостей:</b> ${escapeHtml(payload.guests)}`,
        payload.comment ? `<b>Комментарий / предзаказ:</b> ${escapeHtml(payload.comment)}` : ""
    ].filter(Boolean);

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: lines.join("\n"),
            parse_mode: "HTML"
        })
    });

    if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
    }
}

function escapeHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function initBookingAndUtilityPages() {
    const thanksPage = document.getElementById("thanksPage");
    const privacyPage = document.getElementById("privacyPage");
    const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");
    const form = document.getElementById("bookingForm");

    function openUtilityPage(pageName) {
        thanksPage.hidden = pageName !== "thanks";
        privacyPage.hidden = pageName !== "privacy";
        if (pageName === "thanks") {
            breadcrumbCurrent.textContent = "Спасибо за заявку";
            history.replaceState(null, "", "#thanks");
        } else if (pageName === "privacy") {
            breadcrumbCurrent.textContent = "Политика конфиденциальности";
            history.replaceState(null, "", "#privacy");
        }
    }

    function closeUtilityPages() {
        thanksPage.hidden = true;
        privacyPage.hidden = true;
        breadcrumbCurrent.textContent = "Ресторан, караоке и ночной клуб «ИМПЕРИЯ»";
        history.replaceState(null, "", "#top");
    }

    if (window.location.hash === "#thanks") openUtilityPage("thanks");
    if (window.location.hash === "#privacy") openUtilityPage("privacy");

    document.body.addEventListener("click", (e) => {
        const bookingTrigger = e.target.closest("[data-open-booking]");
        if (bookingTrigger) {
            document.getElementById("bookingComment").value = `Интересует: ${bookingTrigger.dataset.openBooking}`;
            document.getElementById("hall-map").scrollIntoView({ behavior: "smooth" });
        }

        const pageTrigger = e.target.closest("[data-open-page]");
        if (pageTrigger) {
            e.preventDefault();
            openUtilityPage(pageTrigger.dataset.openPage);
        }

        if (e.target.closest("[data-close-utility]")) {
            closeUtilityPages();
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Отправляем заявку...";

        const fd = new FormData(form);
        const selectedTable = IMPERIA_DATA.tables.find((t) => t.id === selectedTableId);

        const leadData = {
            name: fd.get("guestName"),
            phone: fd.get("guestPhone"),
            zone: fd.get("hallZone"),
            table: selectedTable ? `${selectedTable.label} (депозит ${selectedTable.deposit} ₽)` : "Не выбран на схеме",
            date: fd.get("visitDate"),
            time: fd.get("visitTime"),
            guests: fd.get("guestsCount"),
            comment: fd.get("comment")
        };

        try {
            await sendLeadToTelegram(leadData);

            if (typeof gtag === "function") {
                gtag("event", "generate_lead", { event_category: "booking", event_label: leadData.zone });
            }

            document.getElementById("thanksSummaryText").textContent =
                `${leadData.name}, мы получили вашу заявку (${leadData.zone}, ${leadData.date} в ${leadData.time}). Администратор перезвонит вам гарантированно в течение 2 часов (обычно за 15 минут).`;

            form.reset();
            selectedTableId = null;
            renderHallMap();
            document.getElementById("selectedTableBanner").innerHTML =
                `Выбран стол: <strong>Не выбран (нажмите на схеме)</strong>`;
            preorderItems.length = 0;
            updatePreorderBar();

            openUtilityPage("thanks");
        } catch (err) {
            console.error("Ошибка при отправке заявки:", err);
            alert("Не удалось отправить заявку автоматически. Пожалуйста, позвоните нам по номеру +7 (3842) 63-05-05.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}
