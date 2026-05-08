/* ── Goods Gallery Script ───────────────────────────────────────── */
/* SPA 多次 mount 时若并发 fetch，旧回调会更新已销毁的 DOM，导致分类按钮看似无法切换。*/
/* 使用 AbortController + 在 #goods-gallery-root 上委托点击，避免竞态与重复绑定。 */

(function () {
  "use strict";

  const ARROW_SVG = `<svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 11.5L11.5 2.5M11.5 2.5H5.5M11.5 2.5V8.5"/></svg>`;
  const STAR_SVG  = `<svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.43L7 8.885 3.91 10.5l.59-3.43L2 4.635l3.455-.505L7 1z"/></svg>`;

  window.__goodsGalleryMount = function goodsGalleryMount() {
    const root = document.getElementById("goods-gallery-root");
    if (!root) return;

    if (root._ggAbort) root._ggAbort.abort();
    const ac = new AbortController();
    root._ggAbort = ac;

    let allGoods = [];
    let categories = ["All"];
    let activeCategory = "All";
    let selectedItem = null;

    root.innerHTML = `
    <div class="gg-cats" id="gg-cats"></div>
    <div class="gg-grid" id="gg-grid"></div>
    <div class="gg-overlay" id="gg-overlay" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="gg-modal" id="gg-modal">
        <div class="gg-modal-img-wrap">
          <button type="button" class="gg-modal-close" id="gg-close" aria-label="Close">×</button>
          <img id="gg-modal-img" src="" alt="" />
        </div>
        <div class="gg-modal-body">
          <p class="gg-modal-breadcrumb" id="gg-modal-breadcrumb"></p>
          <div class="gg-modal-title-row">
            <h2 class="gg-modal-name" id="gg-modal-name"></h2>
            <span class="gg-modal-price" id="gg-modal-price"></span>
          </div>
          <div id="gg-modal-staff"></div>
          <p class="gg-modal-desc" id="gg-modal-desc"></p>
          <div class="gg-modal-tags" id="gg-modal-tags"></div>
          <a class="gg-buy-btn" id="gg-buy-btn" target="_blank" rel="noopener noreferrer">
            Purchase link ${ARROW_SVG}
          </a>
        </div>
      </div>
    </div>
  `;

    const catsEl = document.getElementById("gg-cats");
    const gridEl = document.getElementById("gg-grid");
    const overlayEl = document.getElementById("gg-overlay");
    const modalImg = document.getElementById("gg-modal-img");
    const modalBread = document.getElementById("gg-modal-breadcrumb");
    const modalName = document.getElementById("gg-modal-name");
    const modalPrice = document.getElementById("gg-modal-price");
    const modalStaff = document.getElementById("gg-modal-staff");
    const modalDesc = document.getElementById("gg-modal-desc");
    const modalTags = document.getElementById("gg-modal-tags");
    const buyBtn = document.getElementById("gg-buy-btn");
    const closeBtn = document.getElementById("gg-close");

    overlayEl.style.display = "none";
    overlayEl.classList.remove("gg-show");

    function renderCats() {
      catsEl.innerHTML = categories.map(cat => `
      <button type="button" class="gg-cat-btn${cat === activeCategory ? " active" : ""}" data-cat="${String(cat).replace(/"/g, "&quot;")}">
        ${cat}
      </button>
    `).join("");
    }

    function renderGrid() {
      const filtered = activeCategory === "All"
        ? allGoods
        : allGoods.filter(g => g.category === activeCategory);

      if (filtered.length === 0) {
        gridEl.innerHTML = `<p class="gg-empty">No items in this category yet.</p>`;
        return;
      }

      gridEl.innerHTML = filtered.map(item => `
      <div class="gg-card" data-id="${item.id}" role="button" tabindex="0" aria-label="${item.name}">
        ${item.staffPick ? `<div class="gg-staff-badge">${STAR_SVG} Staff pick</div>` : ""}
        <div class="gg-arrow-btn" aria-hidden="true">${ARROW_SVG}</div>
        <div class="gg-img-wrap">
          ${item.image
            ? `<img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"/>
               <div class="gg-img-placeholder" style="display:none"></div>`
            : `<div class="gg-img-placeholder"></div>`
          }
        </div>
        <div class="gg-card-body">
          <p class="gg-card-meta">${item.brand} · ${item.category}</p>
          <div class="gg-card-row">
            <span class="gg-card-name">${item.name}</span>
            <span class="gg-card-price">${item.price}</span>
          </div>
        </div>
      </div>
    `).join("");

      gridEl.querySelectorAll(".gg-card").forEach(card => {
        const open = () => {
          const item = allGoods.find(g => g.id === card.dataset.id);
          if (item) openModal(item);
        };
        card.addEventListener("click", open);
        card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") open(); });
      });
    }

    function openModal(item) {
      selectedItem = item;

      modalImg.src = item.image || "";
      modalImg.alt = item.name;
      modalBread.textContent = `${item.brand} · ${item.category}`;
      modalName.textContent = item.name;
      modalPrice.textContent = item.price;
      modalDesc.textContent = item.description || "";
      buyBtn.href = item.link || "#";

      modalStaff.innerHTML = item.staffPick
        ? `<div class="gg-modal-staff">${STAR_SVG} Staff pick</div>`
        : "";

      modalTags.innerHTML = (item.tags || [])
        .map(t => `<span class="gg-modal-tag">${t}</span>`)
        .join("");

      document.getElementById("gg-modal").scrollTop = 0;

      overlayEl.style.display = "flex";
      overlayEl.setAttribute("aria-hidden", "false");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        overlayEl.classList.add("gg-show");
      }));
    }

    function closeModal() {
      overlayEl.classList.remove("gg-show");
      overlayEl.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        overlayEl.style.display = "none";
        selectedItem = null;
      }, 340);
    }

    function handleEsc(e) {
      if (e.key !== "Escape") return;
      if (!overlayEl.classList.contains("gg-show")) return;
      closeModal();
    }

    document.addEventListener("keydown", handleEsc, { signal: ac.signal });

    root.addEventListener("click", (e) => {
      const catBtn = e.target.closest(".gg-cat-btn");
      if (catBtn && catsEl && catsEl.contains(catBtn)) {
        const next = catBtn.getAttribute("data-cat");
        if (next != null && next !== activeCategory) {
          activeCategory = next;
          renderCats();
          renderGrid();
        }
        return;
      }

      const card = e.target.closest(".gg-card");
      if (card && gridEl && gridEl.contains(card)) {
        return;
      }
    }, { signal: ac.signal });

    closeBtn.addEventListener("click", closeModal, { signal: ac.signal });
    overlayEl.addEventListener("click", e => {
      if (e.target === overlayEl) closeModal();
    }, { signal: ac.signal });

    fetch("/static/goods/goods-data.json", { cache: "no-store", signal: ac.signal })
      .then(r => {
        if (!r.ok) throw new Error("Failed to load goods-data.json: " + r.status);
        return r.json();
      })
      .then(data => {
        allGoods = data;
        const catSet = new Set(data.map(g => g.category));
        categories = ["All", ...Array.from(catSet).sort()];
        activeCategory = "All";
        renderCats();
        renderGrid();
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        console.error("[GoodsGallery]", err);
        root.innerHTML = `<p style="color:var(--gray);font-size:14px;padding:2rem 0;">Failed to load goods data.</p>`;
      });
  };
})();
