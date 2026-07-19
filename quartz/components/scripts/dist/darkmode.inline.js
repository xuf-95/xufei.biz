var _a;
// Default to the dark theme on first visit on any device, ignoring the
// device's OS color-scheme preference. An explicit user choice made via the
// toggle is still honored, since it's persisted to localStorage.
var currentTheme = (_a = localStorage.getItem("theme")) !== null && _a !== void 0 ? _a : "dark";
document.documentElement.setAttribute("saved-theme", currentTheme);
var emitThemeChangeEvent = function (theme) {
    var event = new CustomEvent("themechange", {
        detail: { theme: theme }
    });
    document.dispatchEvent(event);
};
document.addEventListener("nav", function () {
    var switchTheme = function () {
        var newTheme = document.documentElement.getAttribute("saved-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("saved-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        emitThemeChangeEvent(newTheme);
    };
    var themeChange = function (e) {
        var newTheme = e.matches ? "dark" : "light";
        document.documentElement.setAttribute("saved-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        emitThemeChangeEvent(newTheme);
    };
    var _loop_1 = function (darkmodeButton) {
        darkmodeButton.addEventListener("click", switchTheme);
        window.addCleanup(function () { return darkmodeButton.removeEventListener("click", switchTheme); });
    };
    for (var _i = 0, _a = document.getElementsByClassName("darkmode"); _i < _a.length; _i++) {
        var darkmodeButton = _a[_i];
        _loop_1(darkmodeButton);
    }
    // Listen for changes in prefers-color-scheme
    var colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    colorSchemeMediaQuery.addEventListener("change", themeChange);
    window.addCleanup(function () { return colorSchemeMediaQuery.removeEventListener("change", themeChange); });
});
