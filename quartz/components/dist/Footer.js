"use strict";
exports.__esModule = true;
var footer_scss_1 = require("./styles/footer.scss");
var package_json_1 = require("../../package.json");
var i18n_1 = require("../i18n");
var footerGroups = [
    {
        title: "Index",
        items: [
            // { label: "Map", href: "/Map/" },
            { label: "AI", href: "/AI/" },
            { label: "BigData", href: "/BigData/" },
            { label: "Data Architecture", href: "/BigData/Data-Architecture/" },
            { label: "Data Store", href: "/BigData/Data-Store/" },
            { label: "Data Cloud", href: "/BigData/Cloud/" },
            { label: "Posts", href: "/Posts/" },
        ]
    },
    {
        title: "Open BigData",
        items: [
            { label: "Apache Spark", href: "/BigData/ApacheSpark" },
            { label: "Apache Hadoop", href: "/BigData/ApacheHadoop" },
            { label: "Apache Flink", href: "/BigData/ApacheFlink" },
            { label: "Apache Hive", href: "/BigData/ApacheHive" },
            { label: "Apache Paimon", href: "/BigData/ApachePaimon" },
        ]
    },
    {
        title: "Data Architecture",
        items: [
            { label: "DCMM", href: "/BigData/Data-Architecture/DCMM" },
            { label: "Data Mesh", href: "/BigData/Data-Architecture/DataMesh" },
            { label: "Data Lake", href: "/BigData/Data-Architecture/DataLake" },
            { label: "Lakehouse", href: "/BigData/Data-Architecture/Lakehouse" },
            { label: "Lambda Architecture", href: "/Data-Architecture/LambdaArchitecture" },
        ]
    },
];
function siteRootPrefix(cfg) {
    if (!(cfg === null || cfg === void 0 ? void 0 : cfg.baseUrl))
        return "";
    try {
        var pathname = new URL(cfg.baseUrl).pathname.replace(/\/$/, "");
        return pathname === "/" ? "" : pathname;
    }
    catch (_a) {
        return "";
    }
}
function absSitePath(cfg, path) {
    if (/^https?:\/\//.test(path))
        return path;
    var p = path.startsWith("/") ? path : "/" + path;
    return "" + siteRootPrefix(cfg) + p;
}
exports["default"] = (function (opts) {
    var Footer = function (_a) {
        var _b;
        var displayClass = _a.displayClass, cfg = _a.cfg;
        var year = new Date().getFullYear();
        var links = (_b = opts === null || opts === void 0 ? void 0 : opts.links) !== null && _b !== void 0 ? _b : {};
        var iconPath = absSitePath(cfg, "/static/icon-transparent.svg");
        return (React.createElement("footer", { "class": (displayClass !== null && displayClass !== void 0 ? displayClass : "") + " site-footer" },
            React.createElement("div", { "class": "footer-shell" },
                React.createElement("section", { "class": "footer-brand-panel", "aria-label": "Site" },
                    React.createElement("a", { href: absSitePath(cfg, "/"), "class": "footer-brand" },
                        React.createElement("img", { src: iconPath, alt: "", "class": "footer-logo" }),
                        React.createElement("span", { "class": "footer-brand-name" }, cfg.pageTitle)),
                    React.createElement("p", { "class": "footer-tagline" }, "Data engineering notes, architecture maps, and working references."),
                    React.createElement("ul", { "class": "footer-social" }, Object.entries(links).map(function (_a) {
                        var text = _a[0], link = _a[1];
                        return (React.createElement("li", null,
                            React.createElement("a", { href: link }, text)));
                    }))),
                React.createElement("nav", { "class": "footer-directory", "aria-label": "Index footer" }, footerGroups.map(function (group) { return (React.createElement("section", { "class": "footer-group" },
                    React.createElement("h2", null, group.title),
                    React.createElement("ul", null, group.items.map(function (item) { return (React.createElement("li", null,
                        React.createElement("a", { href: absSitePath(cfg, item.href) }, item.label))); })))); })),
                React.createElement("div", { "class": "footer-bottom" },
                    React.createElement("p", null,
                        "\u00A9 ",
                        year,
                        " xufei.biz. All rights reserved."),
                    React.createElement("p", { "class": "footer-powered" },
                        i18n_1.i18n(cfg.locale).components.footer.createdWith,
                        " ",
                        React.createElement("a", { href: "https://quartz.jzhao.xyz/" },
                            "Quartz v",
                            package_json_1.version))))));
    };
    Footer.css = footer_scss_1["default"];
    return Footer;
});
satisfies;
QuartzComponentConstructor;
