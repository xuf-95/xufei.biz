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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.BrowsePage = void 0;
var Header_1 = require("../../components/Header");
var Body_1 = require("../../components/Body");
var path_1 = require("../../util/path");
var vfile_1 = require("../vfile");
var helpers_1 = require("./helpers");
var renderPage_1 = require("../../components/renderPage");
var components_1 = require("../../components");
var quartz_layout_1 = require("../../../quartz.layout");
exports.BrowsePage = function (userOpts) {
    var opts = __assign(__assign(__assign(__assign({}, quartz_layout_1.sharedPageComponents), quartz_layout_1.defaultListPageLayout), userOpts), { pageBody: components_1.BrowseAllContent({ showFolderCount: true }) });
    var Head = opts.head, header = opts.header, beforeBody = opts.beforeBody, pageBody = opts.pageBody, afterBody = opts.afterBody, left = opts.left, right = opts.right, Footer = opts.footer;
    var Header = Header_1["default"]();
    var Body = Body_1["default"]();
    return {
        name: "BrowsePage",
        getQuartzComponents: function () {
            return __spreadArrays([
                Head,
                Header,
                Body
            ], header, beforeBody, [
                pageBody
            ], afterBody, left, right, [
                Footer,
            ]);
        },
        emit: function (ctx, content, resources) {
            return __asyncGenerator(this, arguments, function emit_1() {
                var cfg, slug, _a, tree, vfile, externalResources, componentData;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            cfg = ctx.cfg.configuration;
                            slug = "browse/index";
                            _a = vfile_1.defaultProcessedContent({
                                slug: slug,
                                text: "",
                                // description: "Browse all content",
                                frontmatter: { title: "Browse All", tags: [] }
                            }), tree = _a[0], vfile = _a[1];
                            externalResources = renderPage_1.pageResources(path_1.pathToRoot(slug), resources);
                            componentData = {
                                ctx: ctx,
                                fileData: vfile.data,
                                externalResources: externalResources,
                                cfg: cfg,
                                children: [],
                                tree: tree,
                                allFiles: content.map(function (_a) {
                                    var file = _a[1];
                                    return file.data;
                                })
                            };
                            return [4 /*yield*/, __await(helpers_1.write({
                                    ctx: ctx,
                                    content: renderPage_1.renderPage(cfg, slug, componentData, opts, externalResources),
                                    slug: slug,
                                    ext: ".html"
                                }))];
                        case 1: return [4 /*yield*/, _b.sent()];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        partialEmit: function () { return __asyncGenerator(this, arguments, function partialEmit_1() { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); }
    };
};
