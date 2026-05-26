/**
 * 简单的关键字转双链转换脚本
 * 功能：将文本中的关键字自动转换为Obsidian双链格式
 *
 * 使用方法：
 * 1. 将此脚本放在obsidian的scripts文件夹中
 * 2. 在Obsidian中通过命令面板运行
 */

const { app } = globalThis;

/**
 * 主函数：转换选中文本中的关键字
 */
async function convertSelectedKeywords() {
    const editor = app.workspace.activeEditor?.editor;
    if (!editor) {
        console.log("没有活动的编辑器");
        return;
    }

    // 获取选中文本或当前光标位置的单词
    const selection = editor.getSelection();
    const targetText = selection || getCurrentWord(editor);

    if (!targetText || !targetText.trim()) {
        console.log("请选择要转换的文本或将光标放在单词上");
        return;
    }

    try {
        // 获取所有页面信息
        const pages = getAllPages();
        console.log(`找到 ${pages.length} 个页面`);

        // 查找匹配的关键字
        const matches = findMatches(targetText, pages);

        if (matches.length === 0) {
            console.log(`未找到匹配的关键字: ${targetText}`);
            return;
        }

        // 如果只有一个匹配项，直接转换
        if (matches.length === 1) {
            const wikilink = `[[${matches[0].title}]]`;
            replaceText(editor, targetText, wikilink);
            console.log(`已转换: ${targetText} -> ${wikilink}`);
            return;
        }

        // 多个匹配项，显示选项
        const selectedTitle = showMatches(matches, targetText);
        if (selectedTitle) {
            const wikilink = `[[${selectedTitle}]]`;
            replaceText(editor, targetText, wikilink);
            console.log(`已选择: ${targetText} -> ${wikilink}`);
        }
    } catch (error) {
        console.error("转换过程中出错:", error);
    }
}

/**
 * 批量转换当前文件中的所有匹配关键字
 */
async function batchConvertFile() {
    const editor = app.workspace.activeEditor?.editor;
    if (!editor) {
        console.log("没有活动的编辑器");
        return;
    }

    const content = editor.getValue();
    if (!content.trim()) {
        console.log("文件内容为空");
        return;
    }

    try {
        // 获取所有页面信息
        const pages = getAllPages();
        console.log(`找到 ${pages.length} 个页面`);

        // 提取文本中所有可能的单词
        const words = extractWords(content);
        console.log(`提取到 ${words.length} 个单词`);

        // 查找所有匹配
        const matches = new Map(); // keyword -> page title

        for (const word of words) {
            const page = findBestMatch(word, pages);
            if (page) {
                matches.set(word, page.title);
            }
        }

        if (matches.size === 0) {
            console.log("未找到任何匹配的关键字");
            return;
        }

        console.log(`找到 ${matches.size} 个匹配项，开始替换...`);

        // 执行替换
        let newContent = content;
        let replacedCount = 0;

        for (const [keyword, pageTitle] of matches) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            const wikilink = `[[${pageTitle}]]`;

            if (regex.test(newContent)) {
                const beforeCount = (newContent.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
                newContent = newContent.replace(regex, wikilink);
                const afterCount = (newContent.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;

                if (beforeCount > afterCount) {
                    replacedCount += beforeCount;
                }
            }
        }

        if (replacedCount > 0) {
            editor.setValue(newContent);
            console.log(`批量转换完成: ${replacedCount} 个关键字被转换为双链`);
        } else {
            console.log("没有执行任何替换");
        }

    } catch (error) {
        console.error("批量转换过程中出错:", error);
    }
}

/**
 * 获取所有页面的信息
 */
function getAllPages() {
    const pages = [];

    // 优先从Dataview获取数据
    if (app.plugins?.plugins?.dataview) {
        try {
            const dvApi = app.plugins.plugins.dataview.api;
            const pagesData = dvApi.pages();

            for (const page of pagesData) {
                const pageInfo = {
                    title: page.file.name,
                    path: page.file.path,
                    aliases: []
                };

                // 获取aliases
                if (page.aliases) {
                    if (Array.isArray(page.aliases)) {
                        pageInfo.aliases = [...page.aliases];
                    } else {
                        pageInfo.aliases = [page.aliases];
                    }
                }

                // 确保title也在aliases中
                if (!pageInfo.aliases.includes(pageInfo.title)) {
                    pageInfo.aliases.push(pageInfo.title);
                }

                pages.push(pageInfo);
            }
        } catch (error) {
            console.log("无法从Dataview获取数据:", error.message);
        }
    }

    // 如果没有从Dataview获取到数据，尝试从文件系统获取
    if (pages.length === 0) {
        getPagesFromFileSystem(pages);
    }

    return pages;
}

/**
 * 从文件系统获取页面信息
 */
function getPagesFromFileSystem(pages) {
    const vault = app.vault;

    async function processFiles() {
        const files = vault.getFiles();

        for (const file of files) {
            if (file.extension === 'md') {
                const pageInfo = {
                    title: file.name.replace(/\.md$/, ''),
                    path: file.path,
                    aliases: []
                };

                try {
                    const content = await vault.read(file);
                    const frontmatter = extractFrontmatter(content);

                    if (frontmatter && frontmatter.aliases) {
                        if (Array.isArray(frontmatter.aliases)) {
                            pageInfo.aliases = [...frontmatter.aliases];
                        } else {
                            pageInfo.aliases = [frontmatter.aliases];
                        }
                    }

                    // 确保title也在aliases中
                    if (!pageInfo.aliases.includes(pageInfo.title)) {
                        pageInfo.aliases.push(pageInfo.title);
                    }

                    pages.push(pageInfo);
                } catch (error) {
                    // 如果读取失败，只使用title
                    pageInfo.aliases = [pageInfo.title];
                    pages.push(pageInfo);
                }
            }
        }
    }

    processFiles();
}

/**
 * 提取YAML frontmatter
 */
function extractFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = content.match(frontmatterRegex);

    if (match && match[1]) {
        try {
            const lines = match[1].split('\n');
            const frontmatter = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const colonIndex = trimmed.indexOf(':');
                    if (colonIndex > 0) {
                        const key = trimmed.substring(0, colonIndex).trim();
                        const value = trimmed.substring(colonIndex + 1).trim();

                        // 处理数组
                        if (value.startsWith('[') && value.endsWith(']')) {
                            const arrayValue = value.slice(1, -1).split(',').map(item => {
                                item = item.trim();
                                return (item.startsWith('"') && item.endsWith('"')) ||
                                       (item.startsWith("'") && item.endsWith("'"))
                                    ? item.slice(1, -1)
                                    : item;
                            });
                            frontmatter[key] = arrayValue.filter(item => item);
                        } else if (value.startsWith('"') && value.endsWith('"')) {
                            frontmatter[key] = value.slice(1, -1);
                        } else {
                            frontmatter[key] = value;
                        }
                    }
                }
            }

            return frontmatter;
        } catch (error) {
            console.error("解析frontmatter时出错:", error);
        }
    }

    return null;
}

/**
 * 获取当前光标位置的单词
 */
function getCurrentWord(editor) {
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    const wordRange = editor.getWordAt(cursor);

    return wordRange ? wordRange.word : null;
}

/**
 * 查找匹配的关键字
 */
function findMatches(keyword, pages) {
    const matches = [];

    for (const page of pages) {
        // 检查title匹配
        if (keyword === page.title) {
            matches.push({
                title: page.title,
                source: 'title',
                page: page
            });
        }

        // 检查aliases匹配
        for (const alias of page.aliases) {
            if (keyword === alias) {
                matches.push({
                    title: page.title,
                    source: 'alias',
                    page: page
                });
                break; // 一个alias只匹配一次
            }
        }
    }

    return matches;
}

/**
 * 查找最佳匹配（用于批量转换）
 */
function findBestMatch(keyword, pages) {
    for (const page of pages) {
        if (keyword === page.title) {
            return page;
        }

        for (const alias of page.aliases) {
            if (keyword === alias) {
                return page;
            }
        }
    }

    return null;
}

/**
 * 提取文本中的单词
 */
function extractWords(text) {
    const words = [];
    const regex = /\b([a-zA-Z][a-zA-Z0-9_]*)\b/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        words.push(match[1]);
    }

    return [...new Set(words)]; // 去重
}

/**
 * 显示匹配选项
 */
function showMatches(matches, keyword) {
    // 由于脚本环境限制，这里简化处理，返回第一个匹配
    console.log(`找到多个匹配项 (关键词: ${keyword}):`);
    matches.forEach((match, index) => {
        console.log(`${index + 1}. [[${match.title}]]${match.source === 'alias' ? ' (别名)' : ''}`);
    });

    return matches[0].title; // 默认返回第一个
}

/**
 * 替换文本
 */
function replaceText(editor, originalText, replacement) {
    const selection = editor.getSelection();

    if (selection) {
        // 有选中文本，替换选中的文本
        editor.replaceRange(replacement, editor.getCursor("from"), editor.getCursor("to"));
    } else {
        // 没有选中文本，替换当前光标位置的单词
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const wordRange = editor.getWordAt(cursor);

        if (wordRange) {
            editor.replaceRange(replacement, wordRange.start, wordRange.end);
        }
    }
}

/**
 * 添加命令到Obsidian
 */
function addCommands() {
    app.commands.addCommand({
        id: "simple-keyword-converter.convert-selected",
        name: "转换选中文字为双链",
        callback: convertSelectedKeywords,
        hotkeys: []
    });

    app.commands.addCommand({
        id: "simple-keyword-converter.batch-convert",
        name: "批量转换文件关键字为双链",
        callback: batchConvertFile,
        hotkeys: []
    });
}

// 初始化脚本
if (app) {
    addCommands();
    console.log("简单关键字转换脚本已加载");
    console.log("可用命令:");
    console.log("1. 转换选中文字为双链");
    console.log("2. 批量转换文件关键字为双链");
} else {
    console.log("此脚本需要在Obsidian环境中运行");
}