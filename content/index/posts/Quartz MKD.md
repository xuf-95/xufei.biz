---
title: Quartz MKD
date: 2026-05-26
tags:
  - quartz
  - md
description:
cardImage: /content/index/Posts/images/antfu.png
publishDate: 2026-03-19
publish: true
draft: true
---

## Wikilinks

- `![[Crossbell IPFS.png]]`: embeds an image into the page
- `![[Crossbell IPFS.png|100x145]]`: embeds an image into the page with dimensions 100px by 145px
- `![[Link Icon Test.md]]`: transclude an entire page
- `![[Link Icon Test.md#anchor|Anchor]]`: transclude everything under the header `Anchor`
- `![[Link Icon Test.md#^b15695|^b15695]]`: transclude block with ID `^b15695`

> [!column|flex 3]
>
> > [!warning] Use Nested Callouts
> >
> > `[column]` is designed to have callouts nested within it.
> >
> > To remove styling from nested callouts, add `clean no-title` to the metadata
>
> > [!NOTE|clean no-t]
> >
> > This callout has `clean no-title` metadata.
> >
> > ```markdown title="syntax:"
> > > [!column]
> > >
> > > > [!note] title
> > > >
> > > > content
> > >
> > > > [!column] title
> > > >
> > > > content
> > ```
>
> > [!caption]
> >
> > ![[Crossbell IPFS.png|wsmall]]
> >
> > A caption callout nested in the grid.

### Captions

> [!caption|right]
>
> ![[Crossbell IPFS.png|wsmall]]
>
> `[!caption|right]` callout

A borderless callout for adding captions to images.

Use [[custom-formatting-features#Callout Positioning|Callout Positioning]] metadata to float these left or right for wiki-style article image captions

```markdown title="syntax"
> [!caption]
>
> ![[Crossbell IPFS.png]]
>
> Image caption.
```

<br>
Zettelkasten[^1]

[^1]: 这里是右侧标注内容。

### Infobox

A wiki-style infobox displayed in the top right of an article to summarize data from the article, such as requirements for a tutorial article.

> [!infobox]
>
> ## Infobox
>
> ![[Crossbell IPFS.png]]
>
> ### Table
>
> | Type | Name |
> | ---- | ---- |
> | Row  | Row  |
> | Row  | Row  |

**Type:**

- `[!infobox]`

**Syntax:**

```
> [!infobox]
>
> ## Article Title
>
> ![[image]]
>
> ### Table Heading
>
> | Type | Name |
> | --- | --- |
> | Row | Row |
> | Row | Row |
```

---

## Embed Adjustments

Adjustments for Obsidian [embedded files](https://help.obsidian.md/Linking+notes+and+files/Embed+files), otherwise known as 'transclusions'

```markdown title="syntax"
![[Embedded Note|attribute attribute]]

![[intereting-note-title|clean right]]
```

| Attribute | Description                        |
| --------- | ---------------------------------- |
| `clean`   | Removes border to hide embed style |
| `left`    | Float                              |
| `right`   | Floats embed to the right          |

### Hide Embed Styling

You can hide the borders of embedded notes and blocks by adding '`|clean]]`' to the wikilink's alias.
^4beb5b

This allows the embed to appear seamlessly as a part of the page it is embedded in.

> [!column|2 flex clean]
>
> > [!example] This is a standard transclusion:
> >
> > - ews
> > - ss
>
> > [!example] This is a 'clean' transclusion:
> >
> > - we
> > - ses

> [!warning] Embedding block links which float left or right
> You must add a `left` or `right` attribute to embeds if the embedded content itself already floats left or right.
>
> **Example:**
>
> - The [[custom-formatting-features#Infobox|infobox callout]] already floats right. To embed it in another page, add `|right` to the embed wikilink's alias.
>
> This prevents the embed from taking up 100% of the page-width, instead of wrapping around other content

### Float Embed Left or Right

Embeds can be made to float to the left or right of a page by adding `|left` or `|right` to the embed wikilink's alias. ^cb5c00

As well as being a stylistic choice to move supplementary content outside of the main flow of the text, it is also necessary when embedding a block which contains an element with a float property already stipulated (e.g., an infobox callout).

## Daedric Font

Daedric style font can be added by wrapping text in HTML `<span>` tags, courtesy of George Duffner's [OMW Ayembedt font](https://github.com/georgd/OpenMW-Fonts) (license: [SIL Open Font License](https://openfontlicense.org/).

**Syntax**:

```markdown
<span class="daedric">your daedric text here</span>
```

> [!example]
>
> **Regular Text**: "Morrowind"
> **Daedric Text**: "<span class="daedric">"Morrowind"</span>"

## Gallery Card View

Use this reusable card view on any page by copying the HTML block and changing each card link, title, and subtitle.

<nav class="gallery-card-view" aria-label="Featured page gallery">
  <a class="gallery-card internal" href="/index/Posts/Markdown%20syntax%20guide">
    <span class="gallery-card-title">Learning English</span>
    <span class="gallery-card-subtitle">Self-taught, total immersion</span>
  </a>
  <a class="gallery-card internal" href="/index/Posts/Awesome%20Digital%20Garden">
    <span class="gallery-card-title">Building in Public</span>
    <span class="gallery-card-subtitle">Ship, share, get noticed</span>
  </a>
  <a class="gallery-card internal" href="/index/Posts/Links%20Anythings">
    <span class="gallery-card-title">Remote Careers</span>
    <span class="gallery-card-subtitle">Visibility over CVs</span>
  </a>
  <a class="gallery-card internal" href="/index/Posts/Interesting%20Website">
    <span class="gallery-card-title">Design Engineering</span>
    <span class="gallery-card-subtitle">Design + code = superpower</span>
  </a>
</nav>

## Process Steps Layout

Use this reusable process view on any page by copying the HTML block and changing each step title and description.

<section class="process-steps-panel" aria-labelledby="process-steps-title">
  <h2 id="process-steps-title">How it works</h2>
  <ol class="process-steps">
    <li class="process-step">
      <span class="process-step-marker">1</span>
      <div class="process-step-body">
        <h3>Create an agent</h3>
        <p>Define the model, system prompt, tools, MCP servers, and skills. Create the agent once and reference it by ID across sessions.</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">2</span>
      <div class="process-step-body">
        <h3>Create an environment</h3>
        <p>Configure where the agent runs: a cloud sandbox, or a <a class="internal" href="/index/Posts/Quartz%20MKD">self-hosted sandbox</a> on your own infrastructure.</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">3</span>
      <div class="process-step-body">
        <h3>Start a session</h3>
        <p>Launch a session that references your agent and environment configuration.</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">4</span>
      <div class="process-step-body">
        <h3>Send events and stream responses</h3>
        <p>Send user messages as events. The agent autonomously executes tools and streams back results through server-sent events. Event history is persisted server-side and can be fetched in full.</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">5</span>
      <div class="process-step-body">
        <h3>Steer or interrupt</h3>
        <p>Send additional user events to guide the agent mid-execution, or interrupt it to change direction.</p>
      </div>
    </li>
  </ol>
</section>

<div class="qt-wrap">
  <input class="qt-radio" type="radio" name="quote-tab-qmkd" id="qt-cursor" checked />
  <input class="qt-radio" type="radio" name="quote-tab-qmkd" id="qt-lovable" />
  <input class="qt-radio" type="radio" name="quote-tab-qmkd" id="qt-cognition" />

  <div class="qt-bar">
    <label for="qt-cursor">Cursor</label>
    <label for="qt-lovable">Lovable</label>
    <label for="qt-cognition">Cognition</label>
  </div>

  <div class="qt-panels">
    <div class="qt-panel qt-panel-cursor">
      <blockquote>
        <p>“GPT-5.5 is noticeably smarter and more persistent than GPT-5.4, with stronger coding performance and more reliable tool use. It stays on task for significantly longer without stopping early, which matters most for the complex, long-running work our users delegate to Cursor.”
— Michael Truell, Co-founder & CEO at Cursor</p>
      </blockquote>
      <p class="qt-attribution">— Michael Truell, Co-founder & CEO at Cursor</p>
    </div>
    <div class="qt-panel qt-panel-lovable">
      <blockquote>
        <p>Builders want continuous progress …（Lovable 引用正文）</p>
      </blockquote>
      <p class="qt-attribution">— Fabian Hedin, CTO & Co-founder at Lovable</p>
    </div>
    <div class="qt-panel qt-panel-cognition">
      <blockquote>
        <p>第三段文案 …</p>
      </blockquote>
      <p class="qt-attribution">— 署名</p>
    </div>
  </div>
</div>

iframe

<iframe 
src="/static/flink_wordcount.html" 
width="100%" 
height="720" 
style="border:0;"></iframe>
## Callout

> [!box]
> Normal content displayed inside a grey bordered box.
> No blur, no hover effect — just a clean styled container.

> [!info] Default title

> [!question]+ Can callouts be *nested*?
>
> > [!todo]- Yes!, they can. And collapsed!
> >
> > > [!example] You can even use multiple layers of nesting.

> [!abstract] Aliases: "abstract", "summary", "tldr"

> [!info] Aliases: "info"

> [!todo] Aliases: "todo"

> [!success] Aliases: "success", "check", "done"

> [!question] Aliases: "question", "help", "faq"

> [!failure] Aliases: "failure", "missing", "fail"

> [!danger] Aliases: "danger", "error"

> [!bug] Aliases: "bug"

> [!example] Aliases: "example"

> [!quote] Aliases: "quote", "cite"

> [!tree] Aliases: "quote", "cite"

> [!blur]
> This content is hidden until hovered. Works as a spoiler box or redaction block.

> [Fetching Title#6kdx](https://github.com/jackyzha0/quartz/blob/v4/docs/features/callouts.md

---

## Image Size and Layout Tests

This section records image size aliases and in-article layout formats for Quartz Markdown rendering.

### Wikilink Size Aliases

| Format           | Test                             |
| ---------------- | -------------------------------- |
| Original         | ![[Crossbell IPFS.png]]          |
| `wmicro`         | ![[Crossbell IPFS.png\|wmicro]]  |
| `wtiny`          | ![[Crossbell IPFS.png\|wtiny]]   |
| `wsmall`         | ![[Crossbell IPFS.png\|wsmall]]  |
| `wmed`           | ![[Crossbell IPFS.png\|wmed]]    |
| Fixed dimensions | ![[Crossbell IPFS.png\|100x145]] |

### Inline Text Flow

<figure class="image-layout-aside">
  <img src="/index/Posts/images/Crossbell%20IPFS.png" alt="Right floated layout test" />
  <figcaption>Right floated figure</figcaption>
</figure>

The right-floated image should sit beside this paragraph while text wraps naturally around it. This checks the most common wiki-style article layout where an image supports the surrounding explanation instead of occupying a full row.

The paragraph continues long enough to verify wrapping, spacing, and the return to normal document flow after the figure. On narrow screens, the figure should become full width and sit between paragraphs.

<div class="image-layout-clear"></div>

<figure class="image-layout-aside is-left">
  <img src="/index/Posts/images/Crossbell%20IPFS.png" alt="Left floated layout test" />
  <figcaption>Left floated figure</figcaption>
</figure>

The left-floated image mirrors the previous layout. It is useful for checking whether margins, captions, and text flow remain balanced when the image moves to the opposite side of the article.

<div class="image-layout-clear"></div>

### Grid, Feature, and Mosaic

<div class="image-layout-test">
  <p class="image-layout-note">These blocks use <code>quartz/styles/images-layouts.scss</code>.</p>

  <div class="image-layout-row">
    <figure class="image-layout-card">
      <img src="/index/Posts/images/Crossbell%20IPFS.png" alt="Default card image layout" />
      <figcaption>Default card</figcaption>
    </figure>
    <figure class="image-layout-card is-square">
      <img src="/index/Posts/images/Crossbell%20IPFS.png" alt="Square cropped image layout" />
      <figcaption>Square crop</figcaption>
    </figure>
    <figure class="image-layout-card is-wide">
      <img src="/index/Posts/images/Crossbell%20IPFS.png" alt="Wide cropped image layout" />
      <figcaption>16:9 crop</figcaption>
    </figure>
  </div>

  <figure class="image-layout-feature">
    <img src="/index/Posts/images/Crossbell%20IPFS.png" alt="Full width feature image layout" />
    <figcaption>Full-width feature image</figcaption>
  </figure>

  <figure class="image-layout-feature is-contained">
    <img src="/index/Posts/images/Crossbell%20IPFS.png" alt="Contained feature image layout" />
    <figcaption>Contained feature image</figcaption>
  </figure>

  <figure class="image-layout-bleed">
    <img src="/index/Posts/images/Crossbell%20IPFS.png" alt="Viewport wide image layout" />
    <figcaption>Viewport-wide image, ignoring Quartz sidebars and body width</figcaption>
  </figure>

  <figure class="image-layout-bleed" style="--image-layout-width: 70%; --image-layout-height: 20rem;">
    <img src="/index/Posts/images/Crossbell%20IPFS.png" alt="Scaled viewport wide image layout" />
    <figcaption>Viewport-wide container with image width set to 72%</figcaption>
  </figure>

  <figure class="image-layout-scale" style="--image-layout-width: 65%;">
    <img src="/index/Posts/images/Crossbell%20IPFS.png" alt="Percentage scaled image layout" />
    <figcaption>Image scaled to 65% inside the article body</figcaption>
  </figure>

  <figure class="image-layout-fixed" style="--image-layout-width: 520px; --image-layout-height: 180px; --image-layout-fit: cover;">
    <img src="/index/Posts/images/Crossbell%20IPFS.png" alt="Custom fixed size image layout" />
    <figcaption>Custom width and height using CSS variables</figcaption>
  </figure>

  <div class="image-layout-mosaic">
    <figure>
      <img src="/index/Posts/images/Crossbell%20IPFS.png" alt="Large mosaic image layout" />
      <figcaption>Large tile</figcaption>
    </figure>
    <figure>
      <img src="/index/Posts/images/Crossbell%20IPFS.png" alt="Small mosaic image layout one" />
      <figcaption>Small tile</figcaption>
    </figure>
    <figure>
      <img src="/index/Posts/images/Crossbell%20IPFS.png" alt="Small mosaic image layout two" />
      <figcaption>Small tile</figcaption>
    </figure>
  </div>
</div>




<iframe 
src="/static/kafka_sasl_ssl_deep_dive.html" 
width="100%" 
height="720" 
style="border:0;"></iframe>
