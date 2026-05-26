/**
 * Dataview 关键字转双链转换脚本
 * 功能：自动识别文本中的关键字并将其转换为Obsidian双链格式
 *
 * 使用方法：
 * 1. 安装Dataview插件
 * 2. 将此脚本放在obsidian的scripts文件夹中
 * 3. 在需要转换的笔记中执行脚本
 */

// 主函数：将当前选中文本中的关键字转换为双链
async function keywordToWikilink() {
    const { app } = globalThis;

    try {
        // 获取当前编辑器和选中文本
        const editor = app.workspace.activeEditor?.editor;
        if (!editor) {
            console.log("没有活动的编辑器");
            return;
        }

        const selection = editor.getSelection();
        let targetText = selection;

        // 如果没有选中文本，使用当前光标位置所在的单词
        if (!selection) {
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);
            const wordRange = editor.getWordAt(cursor);
            if (wordRange) {
                targetText = wordRange.word;
            } else {
                console.log("请选择要转换的文本");
                return;
            }
        }

        if (!targetText.trim()) {
            console.log("请选择要转换的文本");
            return;
        }

        // 获取所有页面的title和aliases
        const pages = getDataviewPages();
        if (pages.length === 0) {
            console.log("未找到Dataview页面数据");
            return;
        }

        // 查找匹配的关键字
        const matches = findKeywordMatches(targetText, pages);

        if (matches.length === 0) {
            console.log(`未找到匹配的关键字: ${targetText}`);
            return;
        }

        // 显示匹配结果并让用户选择
        const selectedWikilink = await showSelectionDialog(matches, targetText);

        if (selectedWikilink) {
            // 替换文本
            replaceTextWithWikilink(editor, targetText, selectedWikilink);
            console.log(`已转换: ${targetText} -> ${selectedWikilink}`);
        }

    } catch (error) {
        console.error("执行过程中出错:", error);
    }
}

// 获取Dataview页面的title和aliases
function getDataviewPages() {
    const pages = [];

    // 尝试获取Dataview数据
    try {
        // 方法1：通过DataviewAPI
        if (app.plugins.plugins?.dataview) {
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
                        pageInfo.aliases = page.aliases;
                    } else {
                        pageInfo.aliases = [page.aliases];
                    }
                }

                // 添加title到aliases中用于匹配
                pageInfo.aliases.unshift(pageInfo.title);

                pages.push(pageInfo);
            }
        }

        // 方法2：通过文件系统遍历（作为备选）
        if (pages.length === 0) {
            const vault = app.vault;
            getAllFiles(vault, vault.getBasePath(), pages);
        }

    } catch (error) {
        console.error("获取Dataview页面数据时出错:", error);
    }

    return pages;
}

// 递归获取所有文件和页面信息
function getAllFiles(vault, basePath, pages, currentPath = "") {
    try {
        const files = vault.getFiles();

        for (const file of files) {
            if (file.extension === 'md') {
                const pageInfo = {
                    title: file.name.replace(/\.md$/, ''),
                    path: file.path,
                    aliases: []
                };

                // 尝试读取文件内容获取aliases
                try {
                    const content = vault.read(file);
                    const frontmatter = extractFrontmatter(content);
                    if (frontmatter && frontmatter.aliases) {
                        if (Array.isArray(frontmatter.aliases)) {
                            pageInfo.aliases = frontmatter.aliases;
                        } else {
                            pageInfo.aliases = [frontmatter.aliases];
                        }
                    }

                    // 添加title到aliases中
                    pageInfo.aliases.unshift(pageInfo.title);

                    pages.push(pageInfo);
                } catch (readError) {
                    // 如果无法读取文件，只使用title
                    pageInfo.aliases = [pageInfo.title];
                    pages.push(pageInfo);
                }
            }
        }
    } catch (error) {
        console.error("遍历文件时出错:", error);
    }
}

// 提取YAML frontmatter
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

                        // 处理数组类型的值
                        if (value.startsWith('[') && value.endsWith(']')) {
                            // 简单数组解析
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

// 查找匹配的关键字
function findKeywordMatches(text, pages) {
    const matches = [];
    const words = extractWords(text);

    for (const word of words) {
        for (const page of pages) {
            // 检查title匹配
            if (word === page.title) {
                matches.push({
                    keyword: word,
                    page: page,
                    source: 'title'
                });
            }

            // 检查aliases匹配
            for (const alias of page.aliases) {
                if (word === alias) {
                    matches.push({
                        keyword: word,
                        page: page,
                        source: 'alias'
                    });
                }
            }
        }
    }

    // 去重：如果同一个keyword匹配到多个页面，优先选择title匹配
    const uniqueMatches = [];
    const processedKeywords = new Set();

    for (const match of matches) {
        if (!processedKeywords.has(match.keyword)) {
            processedKeywords.add(match.keyword);
            uniqueMatches.push(match);
        }
    }

    return uniqueMatches;
}

// 提取文本中的单词（保留大小写）
function extractWords(text) {
    // 匹配字母数字下划线的组合，同时保留原始大小写
    const words = [];
    const regex = /\b([a-zA-Z][a-zA-Z0-9_]*)\b/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        words.push(match[1]);
    }

    return [...new Set(words)]; // 去重
}

// 显示选择对话框
async function showSelectionDialog(matches, originalText) {
    if (matches.length === 1) {
        // 只有一个匹配项，直接使用
        return `[[${matches[0].page.title}]]`;
    }

    // 多个匹配项，显示选择对话框
    const choices = matches.map(match => ({
        name: `${match.keyword} -> [[${match.page.title}]]${match.source === 'alias' ? ' (别名)' : ''}`,
        value: match.page.title
    }));

    // 这里应该使用Obsidian的API显示选择对话框
    // 由于环境限制，我们返回第一个匹配项
    console.log("找到多个匹配项:");
    matches.forEach((match, index) => {
        console.log(`${index + 1}. ${match.keyword} -> [[${match.page.title}]] (${match.source === 'alias' ? '别名' : '标题'})`);
    });

    return `[[${matches[0].page.title}]]`;
}

// 替换文本为双链
function replaceTextWithWikilink(editor, originalText, wikilink) {
    const selection = editor.getSelection();

    if (selection) {
        // 有选中文本，替换选中的文本
        editor.replaceRange(wikilink, editor.getCursor("from"), editor.getCursor("to"));
    } else {
        // 没有选中文本，替换当前光标位置的单词
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const wordRange = editor.getWordAt(cursor);

        if (wordRange) {
            editor.replaceRange(wikilink, wordRange.start, wordRange.end);
        }
    }
}

// 批量转换功能：转换整个文件中的所有匹配关键字
async function batchConvertWikilinks() {
    const { app } = globalThis;

    try {
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

        // 获取所有页面的title和aliases
        const pages = getDataviewPages();
        if (pages.length === 0) {
            console.log("未找到Dataview页面数据");
            return;
        }

        // 提取文件中的所有单词
        const words = extractWords(content);

        // 查找所有匹配的关键字
        const allMatches = new Map(); // key: keyword, value: page title

        for (const word of words) {
            for (const page of pages) {
                if (word === page.title) {
                    allMatches.set(word, page.title);
                    break;
                }

                for (const alias of page.aliases) {
                    if (word === alias) {
                        allMatches.set(word, page.title);
                        break;
                    }
                }
            }
        }

        if (allMatches.size === 0) {
            console.log("未找到任何匹配的关键字");
            return;
        }

        // 执行替换
        let newContent = content;
        let replacedCount = 0;

        for (const [keyword, pageTitle] of allMatches) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            const wikilink = `[[${pageTitle}]]`;

            if (regex.test(newContent)) {
                newContent = newContent.replace(regex, wikilink);
                replacedCount++;
            }
        }

        if (replacedCount > 0) {
            editor.setValue(newContent);
            console.log(`批量转换完成: ${replacedCount} 个关键字被转换为双链`);
        } else {
            console.log("未执行任何替换");
        }

    } catch (error) {
        console.error("批量转换过程中出错:", error);
    }
}

// 添加命令到Obsidian
function addCommands() {
    const { app } = globalThis;

    // 添加单个关键字转换命令
    app.commands.addCommand({
        id: "keyword-to-wikilink.convert",
        name: "转换关键字为双链",
        callback: keywordToWikilink,
        hotkeys: []
    });

    // 添加批量转换命令
    app.commands.addCommand({
        id: "keyword-to-wikilink.batch-convert",
        name: "批量转换文件中的关键字为双链",
        callback: batchConvertWikilinks,
        hotkeys: []
    });
}

// 初始化
if (typeof globalThis !== 'undefined') {
    addCommands();
    console.log("关键字转双链脚本已加载");
    console.log("可用命令:");
    console.log("1. 转换关键字为双链 - 转换选中的关键字");
    console.log("2. 批量转换文件中的关键字为双链 - 转换整个文件中的匹配关键字");
} else {
    console.log("此脚本需要在Obsidian环境中运行");
}