(function () {
  var DATA_URL = "/static/data-engineer-tools/tools-data.json";

  function faviconFor(url) {
    try {
      var host = new URL(url).hostname;
      return "https://www.google.com/s2/favicons?sz=64&domain=" + encodeURIComponent(host);
    } catch (_) {
      return "";
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function toolMatches(tool, query) {
    if (!query) return true;
    return normalize(tool.name + " " + tool.note + " " + tool.url).includes(query);
  }

  function render(root, data, state) {
    var query = normalize(state.query).trim();
    var active = state.active;
    var categories = data.categories
      .filter(function (category) {
        return active === "all" || category.id === active;
      })
      .map(function (category) {
        return {
          id: category.id,
          title: category.title,
          tools: category.tools.filter(function (tool) {
            return toolMatches(tool, query);
          }),
        };
      })
      .filter(function (category) {
        return category.tools.length > 0;
      });

    var total = categories.reduce(function (sum, category) {
      return sum + category.tools.length;
    }, 0);
    var totalAll = data.categories.reduce(function (sum, category) {
      return sum + category.tools.length;
    }, 0);

    root.innerHTML = [
      '<main class="det-shell">',
      '  <section class="det-hero" aria-labelledby="det-title">',
      '    <p class="det-kicker">Bigdata + AI Engineering</p>',
      '    <h1 id="det-title" class="det-title">Data Engineer Tools</h1>',
      '    <p class="det-subtitle">A list of useful tools for bigdata + AI engineers.</p>',
      "  </section>",
      '  <section class="det-toolbar" aria-label="Tool filters">',
      '    <div class="det-search-wrap">',
      '      <input class="det-search" type="search" placeholder="Search tools" value="' + escapeAttr(state.query) + '" aria-label="Search tools" />',
      "    </div>",
      '    <div class="det-tabs" role="tablist" aria-label="Categories">',
      renderTab("all", "All", state.active),
      data.categories
        .map(function (category) {
          return renderTab(category.id, category.title, state.active);
        })
        .join(""),
      "    </div>",
      "  </section>",
      '  <p class="det-count">' + total + " tools shown / " + totalAll + " curated</p>",
      total > 0 ? renderGrid(categories) : '<div class="det-empty">No tools match this filter.</div>',
      '  <p class="det-source">Curated from <a href="' + data.source.url + '" target="_blank" rel="noopener noreferrer">' + data.source.label + "</a>.</p>",
      "</main>",
    ].join("");

    bind(root, data, state);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }

  function renderTab(id, label, active) {
    return (
      '<button class="det-tab' +
      (active === id ? " is-active" : "") +
      '" type="button" role="tab" aria-selected="' +
      (active === id ? "true" : "false") +
      '" data-category="' +
      escapeAttr(id) +
      '">' +
      escapeHtml(label) +
      "</button>"
    );
  }

  function renderGrid(categories) {
    return (
      '<section class="det-grid" aria-label="Tool list">' +
      categories
        .map(function (category) {
          return (
            '<section class="det-section" data-category-section="' +
            escapeAttr(category.id) +
            '">' +
            '<h2 class="det-section-title">' +
            escapeHtml(category.title) +
            "</h2>" +
            '<div class="det-list">' +
            category.tools.map(renderTool).join("") +
            "</div>" +
            "</section>"
          );
        })
        .join("") +
      "</section>"
    );
  }

  function renderTool(tool) {
    var icon = faviconFor(tool.url);
    return (
      '<a class="det-link" href="' +
      escapeAttr(tool.url) +
      '" target="_blank" rel="noopener noreferrer">' +
      '<img class="det-icon" alt="" loading="lazy" src="' +
      escapeAttr(icon) +
      '" />' +
      "<span>" +
      '<span class="det-name">' +
      escapeHtml(tool.name) +
      "</span>" +
      '<span class="det-note">' +
      escapeHtml(tool.note) +
      "</span>" +
      "</span>" +
      "</a>"
    );
  }

  function bind(root, data, state) {
    root.querySelectorAll(".det-tab").forEach(function (button) {
      button.addEventListener("click", function () {
        state.active = button.dataset.category || "all";
        render(root, data, state);
      });
    });

    var search = root.querySelector(".det-search");
    if (search) {
      search.addEventListener("input", function () {
        state.query = search.value;
        render(root, data, state);
        var nextSearch = root.querySelector(".det-search");
        if (nextSearch) {
          nextSearch.focus();
          nextSearch.setSelectionRange(nextSearch.value.length, nextSearch.value.length);
        }
      });
    }
  }

  window.__dataEngineerToolsMount = function dataEngineerToolsMount() {
    var root = document.getElementById("data-engineer-tools-root");
    if (!root) return;

    if (root.__dataEngineerToolsState && root.__dataEngineerToolsData) {
      render(root, root.__dataEngineerToolsData, root.__dataEngineerToolsState);
      return;
    }

    root.innerHTML = '<main class="det-shell"><p class="det-count">Loading tools...</p></main>';
    fetch(DATA_URL, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("Failed to load tools data: " + response.status);
        return response.json();
      })
      .then(function (data) {
        root.__dataEngineerToolsData = data;
        root.__dataEngineerToolsState = { active: "all", query: "" };
        render(root, data, root.__dataEngineerToolsState);
      })
      .catch(function (error) {
        console.error("[DataEngineerTools]", error);
        root.innerHTML = '<main class="det-shell"><div class="det-empty">Failed to load tools data.</div></main>';
      });
  };
})();
