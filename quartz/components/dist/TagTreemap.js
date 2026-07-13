"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.tagTreemapCss = exports.getTagGroups = void 0;
var path_1 = require("../util/path");
var i18n_1 = require("../i18n");
var lang_1 = require("../util/lang");
var defaultOptions = {
    variant: "index",
    title: "Tag Map",
    showHeader: false,
    showTotal: false
};
function getTagGroups(allFiles) {
    var _a, _b, _c;
    var tagItemMap = new Map();
    for (var _i = 0, allFiles_1 = allFiles; _i < allFiles_1.length; _i++) {
        var file = allFiles_1[_i];
        var tags = __spreadArrays(new Set(((_b = (_a = file.frontmatter) === null || _a === void 0 ? void 0 : _a.tags) !== null && _b !== void 0 ? _b : []).flatMap(path_1.getAllSegmentPrefixes)));
        for (var _d = 0, tags_1 = tags; _d < tags_1.length; _d++) {
            var tag = tags_1[_d];
            var pages = (_c = tagItemMap.get(tag)) !== null && _c !== void 0 ? _c : [];
            pages.push(file);
            tagItemMap.set(tag, pages);
        }
    }
    return __spreadArrays(tagItemMap.entries()).map(function (_a) {
        var tag = _a[0], pages = _a[1];
        return ({ tag: tag, pages: pages });
    })
        .sort(function (a, b) { return a.tag.localeCompare(b.tag); });
}
exports.getTagGroups = getTagGroups;
function layoutRow(items, x, y, w, h, result) {
    if (items.length === 0)
        return;
    var horiz = w >= h;
    var row = [];
    var rowArea = 0;
    var best = Infinity;
    for (var i = 0; i < items.length; i++) {
        var cur = items[i];
        var testRow = __spreadArrays(row, [cur]);
        var testArea = rowArea + cur.sa;
        var rowLen_1 = horiz ? testArea / h : testArea / w;
        var worst = 0;
        for (var _i = 0, testRow_1 = testRow; _i < testRow_1.length; _i++) {
            var it = testRow_1[_i];
            var dim = it.sa / rowLen_1;
            var cw = horiz ? rowLen_1 : dim;
            var ch = horiz ? dim : rowLen_1;
            worst = Math.max(worst, Math.max(cw / ch, ch / cw));
        }
        if (row.length > 0 && worst > best)
            break;
        row.push(cur);
        rowArea += cur.sa;
        best = worst;
    }
    var rowLen = horiz ? rowArea / h : rowArea / w;
    var pos = horiz ? y : x;
    for (var _a = 0, row_1 = row; _a < row_1.length; _a++) {
        var it = row_1[_a];
        var dim = it.sa / rowLen;
        var rect = horiz ? { x: x, y: pos, w: rowLen, h: dim } : { x: pos, y: y, w: dim, h: rowLen };
        result.push(__assign(__assign({}, it), { rect: rect }));
        pos += dim;
    }
    var rest = items.slice(row.length);
    if (rest.length > 0) {
        if (horiz)
            layoutRow(rest, x + rowLen, y, w - rowLen, h, result);
        else
            layoutRow(rest, x, y + rowLen, w, h - rowLen, result);
    }
}
function squarify(items, x, y, w, h) {
    if (items.length === 0)
        return [];
    var total = items.reduce(function (s, i) { return s + i.area; }, 0);
    var scale = (w * h) / total;
    var sorted = __spreadArrays(items).sort(function (a, b) { return b.area - a.area; });
    var scaled = sorted.map(function (i) { return (__assign(__assign({}, i), { sa: i.area * scale })); });
    var result = [];
    layoutRow(scaled, x, y, w, h, result);
    return result;
}
function fitLabel(label, width, fontSize) {
    var maxChars = Math.max(3, Math.floor(width / (fontSize * 0.58)));
    if (label.length <= maxChars)
        return label;
    return label.slice(0, Math.max(1, maxChars - 3)) + "...";
}
var VW = 1000;
var VH = 500;
var GAP = 3;
exports.tagTreemapCss = "\n.tag-treemap-wrap {\n  margin: 1rem 0 2rem 0;\n  width: 100%;\n}\n\n.tag-treemap {\n  display: block;\n  width: 100%;\n  height: auto;\n}\n\n.treemap-rect {\n  fill: var(--highlight);\n  transition: fill 0.15s ease;\n}\n\n.treemap-rect--other {\n  fill: var(--lightgray);\n  opacity: 0.6;\n}\n\n.treemap-cell-link:hover .treemap-rect,\n.treemap-cell-link:focus-visible .treemap-rect {\n  fill: var(--secondary);\n  opacity: 0.85;\n}\n\n.treemap-label {\n  fill: var(--dark);\n  font-family: var(--bodyFont);\n  font-weight: 600;\n  pointer-events: none;\n}\n\n.treemap-count {\n  fill: var(--gray);\n  font-family: var(--bodyFont);\n  pointer-events: none;\n}\n\n.treemap-cell-link {\n  cursor: pointer;\n  text-decoration: none;\n}\n\n.home-tag-map {\n  grid-column: 1 / -1;\n  margin: 2.5rem 0 0;\n  padding-top: 1.5rem;\n}\n\n.home-tag-map__header {\n  display: flex;\n  align-items: end;\n  justify-content: space-between;\n  gap: 1rem;\n  margin-bottom: 0.8rem;\n}\n\n.home-tag-map__header h2 {\n  margin: 0;\n  font-size: 1.35rem;\n}\n\n.home-tag-map__meta {\n  margin: 0;\n  color: var(--gray);\n  font-size: 0.95rem;\n}\n\n.home-tag-map__all {\n  white-space: nowrap;\n  font-weight: 700;\n}\n\n.home-tag-map .tag-treemap-wrap {\n  margin-bottom: 0;\n}\n\nbody[data-slug=\"index\"] #quartz-body .center .page-footer {\n  box-sizing: border-box;\n  width: min(calc(100vw - 4rem), 1080px);\n  max-width: 100%;\n  margin-left: 50%;\n  transform: translateX(-50%);\n}\n\n@media all and (max-width: 800px) {\n  html:has(body[data-slug=\"index\"]),\n  body[data-slug=\"index\"],\n  body[data-slug=\"index\"] .page {\n    box-sizing: border-box !important;\n    width: 100% !important;\n    max-width: 100vw !important;\n    overflow-x: hidden !important;\n  }\n\n  body[data-slug=\"index\"] #quartz-root,\n  body[data-slug=\"index\"] #quartz-body,\n  body[data-slug=\"index\"] #quartz-body .center,\n  body[data-slug=\"index\"] #quartz-body .center > article {\n    box-sizing: border-box !important;\n    width: 100% !important;\n    max-width: 100vw !important;\n    min-width: 0 !important;\n    overflow-x: hidden !important;\n  }\n\n  body[data-slug=\"index\"] #quartz-body .center > article p,\n  body[data-slug=\"index\"] #quartz-body .center > article li {\n    overflow-wrap: anywhere;\n  }\n\n  body[data-slug=\"index\"] #quartz-body .sidebar.left {\n    height: unset !important;\n    min-height: 0 !important;\n    position: initial !important;\n    padding: 0 !important;\n  }\n\n  body[data-slug=\"index\"] #quartz-body .center .page-footer {\n    width: 100%;\n    margin-left: 0;\n    transform: none;\n  }\n\n  .home-tag-map {\n    margin-top: 2rem;\n    padding-top: 1rem;\n  }\n\n  .home-tag-map__header {\n    align-items: start;\n    flex-direction: column;\n    gap: 0.4rem;\n  }\n}\n";
exports["default"] = (function (opts) {
    var options = __assign(__assign({}, defaultOptions), opts);
    var TagTreemap = function (_a) {
        var allFiles = _a.allFiles, cfg = _a.cfg, fileData = _a.fileData, displayClass = _a.displayClass;
        var groups = getTagGroups(allFiles);
        var mainItems = [];
        var otherTags = [];
        for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
            var group = groups_1[_i];
            var count = group.pages.length;
            if (count < 4) {
                otherTags.push(group);
            }
            else {
                mainItems.push({ tag: group.tag, count: count, area: count });
            }
        }
        var otherArticleCount = otherTags.reduce(function (s, group) { return s + group.pages.length; }, 0);
        var otherArea = Math.max(otherArticleCount, mainItems.length > 0 ? mainItems[0].area * 0.3 : 10);
        var allItems = otherTags.length > 0
            ? __spreadArrays(mainItems, [{ tag: "__other__", count: otherTags.length, area: otherArea }]) : mainItems;
        allItems.sort(function (a, b) { return b.area - a.area; });
        var otherIdx = allItems.findIndex(function (i) { return i.tag === "__other__"; });
        if (otherIdx > -1) {
            var otherItem = allItems.splice(otherIdx, 1)[0];
            allItems.push(otherItem);
        }
        var laid = squarify(allItems, 0, 0, VW, VH);
        var totalLabel = i18n_1.i18n(cfg.locale).pages.tagContent.totalTags({ count: groups.length });
        var allTagsHref = path_1.resolveRelative(fileData.slug, "/tags/");
        var treemap = (React.createElement("div", { "class": "tag-treemap-wrap" },
            React.createElement("svg", { "class": "tag-treemap", viewBox: "0 0 " + VW + " " + VH, preserveAspectRatio: "xMidYMid meet", xmlns: "http://www.w3.org/2000/svg", role: "img", "aria-label": totalLabel }, laid.map(function (item) {
                if (!item.rect)
                    return null;
                var _a = item.rect, x = _a.x, y = _a.y, w = _a.w, h = _a.h;
                var rx = x + GAP / 2;
                var ry = y + GAP / 2;
                var rw = w - GAP;
                var rh = h - GAP;
                if (rw <= 2 || rh <= 2)
                    return null;
                var isOther = item.tag === "__other__";
                if (isOther) {
                    var fs_1 = Math.min(Math.max(Math.min(rw / 7, rh / 3.2), 12), 22);
                    var cs_1 = Math.max(fs_1 - 4, 9);
                    return (React.createElement("g", null,
                        React.createElement("rect", { x: rx, y: ry, width: rw, height: rh, rx: "0", "class": "treemap-rect treemap-rect--other" }),
                        React.createElement("text", { x: rx + rw / 2, y: ry + rh / 2 - fs_1 * 0.45, "text-anchor": "middle", "dominant-baseline": "middle", "font-size": fs_1, "class": "treemap-label" }, "other"),
                        React.createElement("text", { x: rx + rw / 2, y: ry + rh / 2 + fs_1 * 0.62, "text-anchor": "middle", "dominant-baseline": "middle", "font-size": cs_1, "class": "treemap-count" },
                            otherTags.length,
                            " tags")));
                }
                var tagListingPage = ("/tags/" + item.tag);
                var href = path_1.resolveRelative(fileData.slug, tagListingPage);
                var fs = Math.min(Math.max(Math.min(rw / 7, rh / 2.8), 10), 22);
                var cs = Math.max(fs - 4, 9);
                var showCount = rh > 35 && rw > 35;
                var label = fitLabel(item.tag, rw - 8, fs);
                return (React.createElement("a", { href: href, "class": "treemap-cell-link" },
                    React.createElement("title", null,
                        item.tag,
                        ": ",
                        item.count),
                    React.createElement("rect", { x: rx, y: ry, width: rw, height: rh, rx: "0", "class": "treemap-rect" }),
                    React.createElement("text", { x: rx + rw / 2, y: ry + (showCount ? rh * 0.42 : rh / 2), "text-anchor": "middle", "dominant-baseline": "middle", "font-size": fs, "class": "treemap-label" }, label),
                    showCount && (React.createElement("text", { x: rx + rw / 2, y: ry + rh * 0.42 + fs + 3, "text-anchor": "middle", "dominant-baseline": "middle", "font-size": cs, "class": "treemap-count" }, item.count))));
            }))));
        if (!options.showHeader && !options.showTotal) {
            return treemap;
        }
        return (React.createElement("section", { "class": lang_1.classNames(displayClass, "tag-treemap-section " + options.variant + "-tag-map") },
            options.showHeader && (React.createElement("div", { "class": options.variant + "-tag-map__header" },
                React.createElement("div", null,
                    React.createElement("h2", null, options.title),
                    options.showTotal && React.createElement("p", { "class": options.variant + "-tag-map__meta" }, totalLabel)),
                React.createElement("a", { "class": options.variant + "-tag-map__all internal", href: allTagsHref }, "All tags"))),
            !options.showHeader && options.showTotal && React.createElement("p", null, totalLabel),
            treemap));
    };
    TagTreemap.css = exports.tagTreemapCss;
    return TagTreemap;
});
satisfies;
QuartzComponentConstructor();
