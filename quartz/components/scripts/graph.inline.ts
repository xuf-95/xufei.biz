import type { ContentDetails } from "../../plugins/emitters/contentIndex"
import {
  SimulationNodeDatum,
  SimulationLinkDatum,
  Simulation,
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceLink,
  forceCollide,
  forceRadial,
  zoomIdentity,
  select,
  drag,
  zoom,
} from "d3"
import { Text, Graphics, Application, Container, Circle } from "pixi.js"
import { Group as TweenGroup, Tween as Tweened } from "@tweenjs/tween.js"
import { registerEscapeHandler, removeAllChildren } from "./util"
import { FullSlug, SimpleSlug, getFullSlug, resolveRelative, simplifySlug } from "../../util/path"
import { D3Config } from "../Graph"

type GraphicsInfo = {
  color: string
  gfx: Graphics
  alpha: number
  active: boolean
}

type NodeData = {
  id: SimpleSlug
  text: string
  tags: string[]
} & SimulationNodeDatum

type SimpleLinkData = {
  source: SimpleSlug
  target: SimpleSlug
}

type LinkData = {
  source: NodeData
  target: NodeData
} & SimulationLinkDatum<NodeData>

type LinkRenderData = GraphicsInfo & {
  simulationData: LinkData
}

type NodeRenderData = GraphicsInfo & {
  simulationData: NodeData
  label: Text
  // starfield extras: a soft halo drawn behind the node + its personal twinkle offset
  glow?: Graphics
  twinklePhase: number
}

const localStorageKey = "graph-visited"
function getVisited(): Set<SimpleSlug> {
  return new Set(JSON.parse(localStorage.getItem(localStorageKey) ?? "[]"))
}

function addToVisited(slug: SimpleSlug) {
  const visited = getVisited()
  visited.add(slug)
  localStorage.setItem(localStorageKey, JSON.stringify([...visited]))
}

type TweenNode = {
  update: (time: number) => void
  stop: () => void
}

async function renderGraph(graph: HTMLElement, fullSlug: FullSlug) {
  const slug = simplifySlug(fullSlug)
  const visited = getVisited()
  removeAllChildren(graph)

  let {
    drag: enableDrag,
    zoom: enableZoom,
    depth,
    scale,
    repelForce,
    centerForce,
    linkDistance,
    fontSize,
    opacityScale,
    removeTags,
    showTags,
    focusOnHover,
    enableRadial,
  } = JSON.parse(graph.dataset["cfg"]!) as D3Config

  const data: Map<SimpleSlug, ContentDetails> = new Map(
    Object.entries<ContentDetails>(await fetchData).map(([k, v]) => [
      simplifySlug(k as FullSlug),
      v,
    ]),
  )
  const links: SimpleLinkData[] = []
  const tags: SimpleSlug[] = []
  const validLinks = new Set(data.keys())

  const tweens = new Map<string, TweenNode>()
  for (const [source, details] of data.entries()) {
    const outgoing = details.links ?? []

    for (const dest of outgoing) {
      if (validLinks.has(dest)) {
        links.push({ source: source, target: dest })
      }
    }

    if (showTags) {
      const localTags = details.tags
        .filter((tag) => !removeTags.includes(tag))
        .map((tag) => simplifySlug(("tags/" + tag) as FullSlug))

      tags.push(...localTags.filter((tag) => !tags.includes(tag)))

      for (const tag of localTags) {
        links.push({ source: source, target: tag })
      }
    }
  }

  const neighbourhood = new Set<SimpleSlug>()
  const wl: (SimpleSlug | "__SENTINEL")[] = [slug, "__SENTINEL"]
  if (depth >= 0) {
    while (depth >= 0 && wl.length > 0) {
      // compute neighbours
      const cur = wl.shift()!
      if (cur === "__SENTINEL") {
        depth--
        wl.push("__SENTINEL")
      } else {
        neighbourhood.add(cur)
        const outgoing = links.filter((l) => l.source === cur)
        const incoming = links.filter((l) => l.target === cur)
        wl.push(...outgoing.map((l) => l.target), ...incoming.map((l) => l.source))
      }
    }
  } else {
    validLinks.forEach((id) => neighbourhood.add(id))
    if (showTags) tags.forEach((tag) => neighbourhood.add(tag))
  }

  const nodes = [...neighbourhood].map((url) => {
    const text = url.startsWith("tags/") ? "#" + url.substring(5) : (data.get(url)?.title ?? url)
    return {
      id: url,
      text,
      tags: data.get(url)?.tags ?? [],
    }
  })
  const graphData: { nodes: NodeData[]; links: LinkData[] } = {
    nodes,
    links: links
      .filter((l) => neighbourhood.has(l.source) && neighbourhood.has(l.target))
      .map((l) => ({
        source: nodes.find((n) => n.id === l.source)!,
        target: nodes.find((n) => n.id === l.target)!,
      })),
  }

  const isLocalGraph = graph.classList.contains("graph-container")
  const hasContentLinks = graphData.links.some(
    ({ source, target }) => !source.id.startsWith("tags/") && !target.id.startsWith("tags/"),
  )
  const isEmptyLocalGraph = isLocalGraph && !hasContentLinks
  graph.closest(".graph")?.classList.toggle("is-empty", isEmptyLocalGraph)
  if (isEmptyLocalGraph) return () => {}

  // link count per node, computed once — forceCollide asks for every node's
  // radius on every tick, so this must not be an O(links) scan each time
  const degreeById = new Map<SimpleSlug, number>()
  for (const l of graphData.links) {
    degreeById.set(l.source.id, (degreeById.get(l.source.id) ?? 0) + 1)
    degreeById.set(l.target.id, (degreeById.get(l.target.id) ?? 0) + 1)
  }
  const degrees = [...degreeById.values()]
  const minDegree = degrees.length ? Math.min(...degrees) : 0
  const maxDegree = degrees.length ? Math.max(...degrees) : 0
  // 0 for the least connected note, 1 for the hub everything hangs off
  const hubness = (d: NodeData) =>
    ((degreeById.get(d.id) ?? 0) - minDegree) / Math.max(1, maxDegree - minDegree)

  const width = graph.offsetWidth
  const height = Math.max(graph.offsetHeight, 250)
  let horizontalStretch = isLocalGraph ? 2 : 1

  // we virtualize the simulation and use pixi to actually render it
  const simulation: Simulation<NodeData, LinkData> = forceSimulation<NodeData>(graphData.nodes)
    .force("charge", forceManyBody().strength(-100 * repelForce))
    .force("center", forceCenter().strength(centerForce))
    .force("link", forceLink(graphData.links).distance(linkDistance))
    .force("collide", forceCollide<NodeData>((n) => nodeRadius(n)).iterations(3))

  const radius = (Math.min(width, height) / 2) * 0.8
  if (enableRadial) {
    simulation.force("radial", forceRadial(radius).strength(0.2))
  } else if (isLocalGraph) {
    // Hub-and-spoke framing: pull each node towards a ring whose radius shrinks
    // with how connected it is, so the notes everything links to (the current
    // page, a busy tag) settle in the middle and the leaves spread evenly
    // around them. The ring has to grow with the node count or they crowd.
    const ringRadius = Math.max(linkDistance * 1.4, (graphData.nodes.length * 15) / (2 * Math.PI))
    simulation.force(
      "radial",
      forceRadial<NodeData>((d) => ringRadius * Math.pow(1 - hubness(d), 1.5), 0, 0).strength(0.32),
    )
  }

  // Frame the constellation like a photograph instead of using a fixed 2x zoom:
  // settle the layout up front, then pick a horizontal stretch and a zoom level
  // that make the whole thing fill the panel with a comfortable margin.
  // Padding is wider horizontally because labels are centred on their node and
  // stick out sideways.
  // wide panels get proportionally wider side padding: labels are centred on
  // their node, so a long title sticks out roughly 100px to either side
  const fitPaddingX = Math.max(72, Math.round(width * 0.08))
  const fitPaddingY = 36
  const referenceZoom = 2
  let fitScale = referenceZoom
  let fitCenter = { x: 0, y: 0 }
  const canFrame = isLocalGraph && graphData.nodes.length > 1 && graphData.nodes.length <= 300
  if (canFrame) {
    // run the simulation to rest synchronously — cheap for a local graph, and it
    // means the constellation is already composed on the first painted frame
    simulation.stop()
    simulation.tick(400)

    const xs = graphData.nodes.map((n) => n.x ?? 0)
    const ys = graphData.nodes.map((n) => n.y ?? 0)
    const rawWidth = Math.max(...xs) - Math.min(...xs)
    const rawHeight = Math.max(...ys) - Math.min(...ys)
    const boxWidth = Math.max(width - fitPaddingX * 2, 120)
    const boxHeight = Math.max(height - fitPaddingY * 2, 120)

    // stretch x so the layout's aspect ratio matches the panel's, within reason
    if (rawWidth > 1 && rawHeight > 1) {
      const wanted = boxWidth / boxHeight / (rawWidth / rawHeight)
      // a generous cap: on the very wide footer panel the extra horizontal
      // spread is what stops long labels from colliding
      horizontalStretch = Math.min(3.6, Math.max(1.2, wanted))
    }

    fitCenter = {
      x: ((Math.min(...xs) + Math.max(...xs)) / 2) * horizontalStretch,
      y: (Math.min(...ys) + Math.max(...ys)) / 2,
    }
    fitScale = Math.min(
      3.2,
      Math.max(
        0.8,
        Math.min(
          boxWidth / Math.max(rawWidth * horizontalStretch, 1),
          boxHeight / Math.max(rawHeight, 1),
        ),
      ),
    )
  }

  // keep on-screen label size independent of how far we had to zoom to fit
  const labelScale = (1 / scale) * (referenceZoom / fitScale)

  // precompute style prop strings as pixi doesn't support css variables
  const cssVars = [
    "--secondary",
    "--tertiary",
    "--gray",
    "--light",
    "--lightgray",
    "--dark",
    "--darkgray",
    "--bodyFont",
  ] as const
  const computedStyleMap = cssVars.reduce(
    (acc, key) => {
      acc[key] = getComputedStyle(document.documentElement).getPropertyValue(key)
      return acc
    },
    {} as Record<(typeof cssVars)[number], string>,
  )

  // "constellation" mode: driven purely by CSS custom properties declared in graph.scss.
  // If --graph-star-core is undefined (e.g. light theme) we fall back to the plain graph.
  const rootStyle = getComputedStyle(document.documentElement)
  const starVar = (name: string) => rootStyle.getPropertyValue(name).trim()
  const starry = starVar("--graph-star-core") !== ""
  const stars = {
    core: starVar("--graph-star-core") || "#ffffff",
    visited: starVar("--graph-star-visited") || "#ffffff",
    current: starVar("--graph-star-current") || "#ffffff",
    glow: starVar("--graph-star-glow") || "#ffffff",
    line: starVar("--graph-constellation-line") || computedStyleMap["--lightgray"],
    lineActive: starVar("--graph-constellation-line-active") || computedStyleMap["--gray"],
  }
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const twinkling = starry && !reduceMotion
  const baseLinkAlpha = starry ? 0.55 : 1

  // calculate color
  const color = (d: NodeData) => {
    const isCurrent = d.id === slug
    if (isCurrent) {
      return starry ? stars.current : computedStyleMap["--secondary"]
    } else if (visited.has(d.id) || d.id.startsWith("tags/")) {
      return starry ? stars.visited : computedStyleMap["--tertiary"]
    } else {
      return starry ? stars.core : computedStyleMap["--gray"]
    }
  }

  function nodeRadius(d: NodeData) {
    return 2 + Math.sqrt(degreeById.get(d.id) ?? 0)
  }

  let hoveredNodeId: string | null = null
  let hoveredNeighbours: Set<string> = new Set()
  // resting label opacity (set by the zoom handler); hovering dims everything
  // that is not part of the hovered constellation down from it
  let baseLabelAlpha = 1
  const dimmedNodeAlpha = starry ? 0.14 : 0.2
  const dimmedLabelAlpha = 0.12
  const linkRenderData: LinkRenderData[] = []
  const nodeRenderData: NodeRenderData[] = []
  function updateHoverInfo(newHoveredId: string | null) {
    hoveredNodeId = newHoveredId

    if (newHoveredId === null) {
      hoveredNeighbours = new Set()
      for (const n of nodeRenderData) {
        n.active = false
      }

      for (const l of linkRenderData) {
        l.active = false
      }
    } else {
      hoveredNeighbours = new Set()
      for (const l of linkRenderData) {
        const linkData = l.simulationData
        if (linkData.source.id === newHoveredId || linkData.target.id === newHoveredId) {
          hoveredNeighbours.add(linkData.source.id)
          hoveredNeighbours.add(linkData.target.id)
        }

        l.active = linkData.source.id === newHoveredId || linkData.target.id === newHoveredId
      }

      for (const n of nodeRenderData) {
        n.active = hoveredNeighbours.has(n.simulationData.id)
      }
    }
  }

  let dragStartTime = 0
  let dragging = false

  function renderLinks() {
    tweens.get("link")?.stop()
    const tweenGroup = new TweenGroup()

    for (const l of linkRenderData) {
      let alpha = baseLinkAlpha

      // if we are hovering over a node, we want to highlight the immediate neighbours
      // with full alpha and the rest with default alpha
      if (hoveredNodeId) {
        alpha = l.active ? 1 : baseLinkAlpha * 0.25
      }

      l.color = l.active
        ? starry
          ? stars.lineActive
          : computedStyleMap["--gray"]
        : starry
          ? stars.line
          : computedStyleMap["--lightgray"]
      tweenGroup.add(new Tweened<LinkRenderData>(l).to({ alpha }, 200))
    }

    tweenGroup.getAll().forEach((tw) => tw.start())
    tweens.set("link", {
      update: tweenGroup.update.bind(tweenGroup),
      stop() {
        tweenGroup.getAll().forEach((tw) => tw.stop())
      },
    })
  }

  function renderLabels() {
    tweens.get("label")?.stop()
    const tweenGroup = new TweenGroup()

    const defaultScale = labelScale
    const activeScale = defaultScale * 1.1
    for (const n of nodeRenderData) {
      const nodeId = n.simulationData.id
      const isHovered = hoveredNodeId === nodeId

      let alpha = baseLabelAlpha
      if (hoveredNodeId !== null) {
        alpha = isHovered || n.active ? 1 : baseLabelAlpha * dimmedLabelAlpha
      }
      const nextScale = isHovered ? activeScale : defaultScale

      tweenGroup.add(
        new Tweened<Text>(n.label).to(
          {
            alpha,
            scale: { x: nextScale, y: nextScale },
          },
          100,
        ),
      )
    }

    tweenGroup.getAll().forEach((tw) => tw.start())
    tweens.set("label", {
      update: tweenGroup.update.bind(tweenGroup),
      stop() {
        tweenGroup.getAll().forEach((tw) => tw.stop())
      },
    })
  }

  function renderNodes() {
    tweens.get("hover")?.stop()

    const tweenGroup = new TweenGroup()
    for (const n of nodeRenderData) {
      let alpha = 1

      // if we are hovering over a node, we want to highlight the immediate neighbours
      if (hoveredNodeId !== null && focusOnHover) {
        const inConstellation = n.active || n.simulationData.id === hoveredNodeId
        alpha = inConstellation ? 1 : dimmedNodeAlpha
      }

      tweenGroup.add(new Tweened<Graphics>(n.gfx, tweenGroup).to({ alpha }, 200))
    }

    tweenGroup.getAll().forEach((tw) => tw.start())
    tweens.set("hover", {
      update: tweenGroup.update.bind(tweenGroup),
      stop() {
        tweenGroup.getAll().forEach((tw) => tw.stop())
      },
    })
  }

  function renderPixiFromD3() {
    renderNodes()
    renderLinks()
    renderLabels()
  }

  tweens.forEach((tween) => tween.stop())
  tweens.clear()

  const app = new Application()
  await app.init({
    width,
    height,
    antialias: true,
    autoStart: false,
    autoDensity: true,
    backgroundAlpha: 0,
    preference: "webgpu",
    resolution: window.devicePixelRatio,
    eventMode: "static",
  })
  graph.appendChild(app.canvas)

  const stage = app.stage
  stage.interactive = false

  const labelsContainer = new Container<Text>({ zIndex: 3, isRenderGroup: true })
  const nodesContainer = new Container<Graphics>({ zIndex: 2, isRenderGroup: true })
  const linkContainer = new Container<Graphics>({ zIndex: 1, isRenderGroup: true })
  const glowContainer = new Container<Graphics>({ zIndex: 0, isRenderGroup: true })
  stage.addChild(glowContainer, nodesContainer, labelsContainer, linkContainer)

  for (const n of graphData.nodes) {
    const nodeId = n.id

    const label = new Text({
      interactive: false,
      eventMode: "none",
      text: n.text,
      alpha: 0,
      anchor: { x: 0.5, y: 1.9 },
      style: {
        fontSize: fontSize * 15,
        fill: computedStyleMap["--dark"],
        fontFamily: computedStyleMap["--bodyFont"],
      },
      resolution: window.devicePixelRatio * 4,
    })
    label.scale.set(labelScale)

    let oldLabelOpacity = 0
    const isTagNode = nodeId.startsWith("tags/")
    const gfx = new Graphics({
      interactive: true,
      label: nodeId,
      eventMode: "static",
      hitArea: new Circle(0, 0, nodeRadius(n)),
      cursor: "pointer",
    })
      .circle(0, 0, nodeRadius(n))
      .fill({ color: isTagNode ? computedStyleMap["--light"] : color(n) })
      .on("pointerover", (e) => {
        updateHoverInfo(e.target.label)
        oldLabelOpacity = label.alpha
        if (!dragging) {
          renderPixiFromD3()
        }
      })
      .on("pointerleave", () => {
        updateHoverInfo(null)
        label.alpha = oldLabelOpacity
        if (!dragging) {
          renderPixiFromD3()
        }
      })

    if (isTagNode) {
      gfx.stroke({ width: 2, color: starry ? stars.visited : computedStyleMap["--tertiary"] })
    }

    // a star is a bright core wrapped in a single halo of its own colour
    let glow: Graphics | undefined
    if (starry) {
      const r = nodeRadius(n)
      glow = new Graphics({ interactive: false, eventMode: "none" })
      glow.circle(0, 0, r * 1.7).fill({ color: color(n), alpha: 0.3 })
      glowContainer.addChild(glow)

      if (!isTagNode) {
        gfx.circle(0, 0, Math.max(0.9, r * 0.45)).fill({ color: "#ffffff", alpha: 0.85 })
      }
    }

    nodesContainer.addChild(gfx)
    labelsContainer.addChild(label)

    const nodeRenderDatum: NodeRenderData = {
      simulationData: n,
      gfx,
      label,
      glow,
      twinklePhase: Math.random() * Math.PI * 2,
      color: color(n),
      alpha: 1,
      active: false,
    }

    nodeRenderData.push(nodeRenderDatum)
  }

  for (const l of graphData.links) {
    const gfx = new Graphics({ interactive: false, eventMode: "none" })
    linkContainer.addChild(gfx)

    const linkRenderDatum: LinkRenderData = {
      simulationData: l,
      gfx,
      color: computedStyleMap["--lightgray"],
      alpha: 1,
      active: false,
    }

    linkRenderData.push(linkRenderDatum)
  }

  let currentTransform = zoomIdentity
  if (enableDrag) {
    select<HTMLCanvasElement, NodeData | undefined>(app.canvas).call(
      drag<HTMLCanvasElement, NodeData | undefined>()
        .container(() => app.canvas)
        .subject(() => graphData.nodes.find((n) => n.id === hoveredNodeId))
        .on("start", function dragstarted(event) {
          if (!event.active) simulation.alphaTarget(1).restart()
          event.subject.fx = event.subject.x
          event.subject.fy = event.subject.y
          event.subject.__initialDragPos = {
            x: event.subject.x,
            y: event.subject.y,
            fx: event.subject.fx,
            fy: event.subject.fy,
          }
          dragStartTime = Date.now()
          dragging = true
        })
        .on("drag", function dragged(event) {
          const initPos = event.subject.__initialDragPos
          event.subject.fx =
            initPos.x + (event.x - initPos.x) / (currentTransform.k * horizontalStretch)
          event.subject.fy = initPos.y + (event.y - initPos.y) / currentTransform.k
        })
        .on("end", function dragended(event) {
          if (!event.active) simulation.alphaTarget(0)
          event.subject.fx = null
          event.subject.fy = null
          dragging = false

          // if the time between mousedown and mouseup is short, we consider it a click
          if (Date.now() - dragStartTime < 500) {
            const node = graphData.nodes.find((n) => n.id === event.subject.id) as NodeData
            const targ = resolveRelative(fullSlug, node.id)
            window.spaNavigate(new URL(targ, window.location.toString()))
          }
        }),
    )
  } else {
    for (const node of nodeRenderData) {
      node.gfx.on("click", () => {
        const targ = resolveRelative(fullSlug, node.simulationData.id)
        window.spaNavigate(new URL(targ, window.location.toString()))
      })
    }
  }

  if (enableZoom) {
    const zoomBehavior = zoom<HTMLCanvasElement, NodeData>()
      .extent([
        [0, 0],
        [width, height],
      ])
      .scaleExtent([0.25, 4])
      .on("zoom", ({ transform }) => {
        currentTransform = transform
        const k = transform.k
        stage.scale.set(k, k)
        stage.position.set(transform.x, transform.y)

        // zoom adjusts opacity of labels too
        const scale = k * opacityScale
        let scaleOpacity = Math.max((scale - 1) / 3.75, 0)
        baseLabelAlpha = Math.min(1, scaleOpacity)
        const activeNodes = nodeRenderData.filter((n) => n.active).flatMap((n) => n.label)

        for (const label of labelsContainer.children) {
          if (!activeNodes.includes(label)) {
            label.alpha =
              hoveredNodeId === null ? baseLabelAlpha : baseLabelAlpha * dimmedLabelAlpha
          }
        }
      })
    const canvasSel = select<HTMLCanvasElement, NodeData>(app.canvas)
    canvasSel.call(zoomBehavior)

    // 初始视角：把星座的包围盒居中并缩放到刚好填满面板（见上面的 fitScale）
    const initialTransform = zoomIdentity
      .translate(width / 2, height / 2)
      .scale(fitScale)
      .translate(-(fitCenter.x + width / 2), -(fitCenter.y + height / 2))
    canvasSel.call(zoomBehavior.transform, initialTransform)
  }

  let stopAnimation = false
  function animate(time: number) {
    if (stopAnimation) return
    for (const n of nodeRenderData) {
      const { x, y } = n.simulationData
      if (!x || !y) continue
      const px = x * horizontalStretch + width / 2
      const py = y + height / 2
      n.gfx.position.set(px, py)
      if (n.label) {
        n.label.position.set(px, py)
      }
      if (n.glow) {
        n.glow.position.set(px, py)
        // slow, per-star breathing so the field never pulses in unison
        const twinkle = twinkling ? 0.78 + 0.22 * Math.sin(time / 1500 + n.twinklePhase) : 1
        n.glow.alpha = n.gfx.alpha * twinkle
      }
    }

    for (const l of linkRenderData) {
      const linkData = l.simulationData
      l.gfx.clear()
      l.gfx.moveTo(
        linkData.source.x! * horizontalStretch + width / 2,
        linkData.source.y! + height / 2,
      )
      l.gfx
        .lineTo(linkData.target.x! * horizontalStretch + width / 2, linkData.target.y! + height / 2)
        .stroke({ alpha: l.alpha, width: 1, color: l.color })
    }

    tweens.forEach((t) => t.update(time))
    app.renderer.render(stage)
    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
  return () => {
    stopAnimation = true
    app.destroy()
  }
}

let localGraphCleanups: (() => void)[] = []
let globalGraphCleanups: (() => void)[] = []

function cleanupLocalGraphs() {
  for (const cleanup of localGraphCleanups) {
    cleanup()
  }
  localGraphCleanups = []
}

function cleanupGlobalGraphs() {
  for (const cleanup of globalGraphCleanups) {
    cleanup()
  }
  globalGraphCleanups = []
}

document.addEventListener("nav", async (e: CustomEventMap["nav"]) => {
  const slug = e.detail.url
  addToVisited(simplifySlug(slug))

  async function renderLocalGraph() {
    cleanupLocalGraphs()
    const localGraphContainers = document.getElementsByClassName("graph-container")
    for (const container of localGraphContainers) {
      localGraphCleanups.push(await renderGraph(container as HTMLElement, slug))
    }
  }

  await renderLocalGraph()
  const handleThemeChange = () => {
    void renderLocalGraph()
  }

  document.addEventListener("themechange", handleThemeChange)
  window.addCleanup(() => {
    document.removeEventListener("themechange", handleThemeChange)
  })

  const containers = [...document.getElementsByClassName("global-graph-outer")] as HTMLElement[]
  async function renderGlobalGraph() {
    const slug = getFullSlug(window)
    for (const container of containers) {
      container.classList.add("active")
      const sidebar = container.closest(".sidebar") as HTMLElement
      if (sidebar) {
        sidebar.style.zIndex = "1"
      }

      const graphContainer = container.querySelector(".global-graph-container") as HTMLElement
      registerEscapeHandler(container, hideGlobalGraph)
      if (graphContainer) {
        globalGraphCleanups.push(await renderGraph(graphContainer, slug))
      }
    }
  }

  function hideGlobalGraph() {
    cleanupGlobalGraphs()
    for (const container of containers) {
      container.classList.remove("active")
      const sidebar = container.closest(".sidebar") as HTMLElement
      if (sidebar) {
        sidebar.style.zIndex = ""
      }
    }
  }

  async function shortcutHandler(e: HTMLElementEventMap["keydown"]) {
    if (e.key === "g" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault()
      const anyGlobalGraphOpen = containers.some((container) =>
        container.classList.contains("active"),
      )
      anyGlobalGraphOpen ? hideGlobalGraph() : renderGlobalGraph()
    }
  }

  const containerIcons = document.getElementsByClassName("global-graph-icon")
  Array.from(containerIcons).forEach((icon) => {
    icon.addEventListener("click", renderGlobalGraph)
    window.addCleanup(() => icon.removeEventListener("click", renderGlobalGraph))
  })

  document.addEventListener("keydown", shortcutHandler)
  window.addCleanup(() => {
    document.removeEventListener("keydown", shortcutHandler)
    cleanupLocalGraphs()
    cleanupGlobalGraphs()
  })
})
