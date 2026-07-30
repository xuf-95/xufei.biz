"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.PageList = exports.PageListViewControls = exports.byDateAndAlphabeticalFolderFirst = exports.byDateAndAlphabetical = void 0;
var path_1 = require("../util/path");
var Date_1 = require("./Date");
function byDateAndAlphabetical(cfg) {
    return function (f1, f2) {
        var _a, _b, _c, _d;
        // Sort by date/alphabetical
        if (f1.dates && f2.dates) {
            // sort descending
            return Date_1.getDate(cfg, f2).getTime() - Date_1.getDate(cfg, f1).getTime();
        }
        else if (f1.dates && !f2.dates) {
            // prioritize files with dates
            return -1;
        }
        else if (!f1.dates && f2.dates) {
            return 1;
        }
        // otherwise, sort lexographically by title
        var f1Title = (_b = (_a = f1.frontmatter) === null || _a === void 0 ? void 0 : _a.title.toLowerCase()) !== null && _b !== void 0 ? _b : "";
        var f2Title = (_d = (_c = f2.frontmatter) === null || _c === void 0 ? void 0 : _c.title.toLowerCase()) !== null && _d !== void 0 ? _d : "";
        return f1Title.localeCompare(f2Title);
    };
}
exports.byDateAndAlphabetical = byDateAndAlphabetical;
function byDateAndAlphabeticalFolderFirst(cfg) {
    return function (f1, f2) {
        var _a, _b, _c, _d, _e, _f;
        // Sort folders first
        var f1IsFolder = path_1.isFolderPath((_a = f1.slug) !== null && _a !== void 0 ? _a : "");
        var f2IsFolder = path_1.isFolderPath((_b = f2.slug) !== null && _b !== void 0 ? _b : "");
        if (f1IsFolder && !f2IsFolder)
            return -1;
        if (!f1IsFolder && f2IsFolder)
            return 1;
        // If both are folders or both are files, sort by date/alphabetical
        if (f1.dates && f2.dates) {
            // sort descending
            return Date_1.getDate(cfg, f2).getTime() - Date_1.getDate(cfg, f1).getTime();
        }
        else if (f1.dates && !f2.dates) {
            // prioritize files with dates
            return -1;
        }
        else if (!f1.dates && f2.dates) {
            return 1;
        }
        // otherwise, sort lexographically by title
        var f1Title = (_d = (_c = f1.frontmatter) === null || _c === void 0 ? void 0 : _c.title.toLowerCase()) !== null && _d !== void 0 ? _d : "";
        var f2Title = (_f = (_e = f2.frontmatter) === null || _e === void 0 ? void 0 : _e.title.toLowerCase()) !== null && _f !== void 0 ? _f : "";
        return f1Title.localeCompare(f2Title);
    };
}
exports.byDateAndAlphabeticalFolderFirst = byDateAndAlphabeticalFolderFirst;
function PageListViewControls() {
    return null;
}
exports.PageListViewControls = PageListViewControls;
function getCardImageSrc(currentSlug, image) {
    if (path_1.isAbsoluteURL(image))
        return image;
    if (image.startsWith("/content/"))
        return "/" + image.slice("/content/".length);
    if (image.startsWith("/"))
        return image;
    if (image.startsWith("content/")) {
        return path_1.resolveRelative(currentSlug, image.slice("content/".length));
    }
    return path_1.resolveRelative(currentSlug, image);
}
function getCardImage(currentSlug, page) {
    var _a;
    var image = (_a = page.frontmatter) === null || _a === void 0 ? void 0 : _a.cardImage;
    if (typeof image === "string" && image.trim().length > 0) {
        return getCardImageSrc(currentSlug, image.trim());
    }
}
exports.PageList = function (_a) {
    var cfg = _a.cfg, fileData = _a.fileData, allFiles = _a.allFiles, limit = _a.limit, sort = _a.sort;
    var sorter = sort !== null && sort !== void 0 ? sort : byDateAndAlphabeticalFolderFirst(cfg);
    var list = __spreadArrays(allFiles).sort(sorter);
    if (limit) {
        list = list.slice(0, limit);
    }
    return (React.createElement("ul", { "class": "section-ul" }, list.map(function (page) {
        var _a, _b;
        var title = (_a = page.frontmatter) === null || _a === void 0 ? void 0 : _a.title;
        var description = (_b = page.frontmatter) === null || _b === void 0 ? void 0 : _b.description;
        var href = path_1.resolveRelative(fileData.slug, page.slug);
        var imageSrc = getCardImage(fileData.slug, page);
        return (React.createElement("li", { "class": "section-li " + (imageSrc ? "has-image" : "") },
            React.createElement("div", { "class": "section" },
                React.createElement("div", { "class": "section-body" },
                    React.createElement("h3", null,
                        React.createElement("a", { href: href, "class": "internal" }, title))),
                React.createElement("p", { "class": "section-date" }, page.dates && React.createElement(Date_1.Date, { date: Date_1.getDate(cfg, page), locale: cfg.locale })))));
    })));
};
exports.PageList.css = "\n.section h3 {\n  margin: 0;\n}\n";
