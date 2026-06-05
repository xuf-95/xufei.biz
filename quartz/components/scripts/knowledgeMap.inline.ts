import {
  drag,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  select,
  zoom,
  zoomIdentity,
} from "d3"
import type { ContentDetails } from "../../plugins/emitters/contentIndex"
import { FullSlug, SimpleSlug, resolveRelative } from "../../util/path"

const visitedKey = "graph-visited"
const mapSlug = "map/index" as FullSlug

type NodeKind = "note" | "tag"
type FilterMode = "all" | "notes" | "tags" | "visited"
type FocusKey = "current" | "related" | "visited" | "tags" | "context"

type MapNode = {
  id: SimpleSlug
  title: string
  kind: NodeKind
  tags: string[]
  details?: ContentDetails
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  visible?: boolean
}

type MapLink = {
  source: MapNode | SimpleSlug
  target: MapNode | SimpleSlug
  kind: "note" | "tag"
}

type MapState = {
  selected: SimpleSlug
  filter: FilterMode
  query: string
  focus: Record<FocusKey, boolean>
  visited: Set<SimpleSlug>
}

let cleanupMap: (() => void) | undefined

function getVisited(): Set<SimpleSlug> {
  try {
    return new Set(JSON.parse(localStorage.getItem(visitedKey) ?? "[]"))
  } catch {
    return new Set()
  }
}

function saveVisited(visited: Set<SimpleSlug>) {
  localStorage.setItem(visitedKey, JSON.stringify([...visited]))
}

function nodeId(nodeOrId: MapNode | SimpleSlug): SimpleSlug {
  return typeof nodeOrId === "string" ? nodeOrId : nodeOrId.id
}

function excerpt(details?: ContentDetails): string {
  const text = details?.description ?? details?.content ?? ""
  return text.replace(/\s+/g, " ").trim().slice(0, 220)
}

function buildMapData(index: Record<FullSlug, ContentDetails>) {
  const pageEntries = Object.entries(index)
    .map(([slug, details]) => [slug as SimpleSlug, details] as const)
    .filter(([slug]) => !slug.startsWith("tags/"))

  const nodes: MapNode[] = pageEntries.map(([id, details]) => ({
    id,
    title: details.title,
    kind: "note",
    tags: details.tags ?? [],
    details,
  }))
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const links: MapLink[] = []
  const tagIds = new Set<SimpleSlug>()

  for (const [id, details] of pageEntries) {
    for (const link of details.links ?? []) {
      const target = link
      if (target !== id && nodeById.has(target)) {
        links.push({ source: id, target, kind: "note" })
      }
    }

    for (const tag of details.tags ?? []) {
      const tagId = `tags/${tag}` as SimpleSlug
      tagIds.add(tagId)
      links.push({ source: id, target: tagId, kind: "tag" })
    }
  }

  for (const tagId of tagIds) {
    const title = `#${tagId.replace(/^tags\//, "")}`
    const node: MapNode = { id: tagId, title, kind: "tag", tags: [] }
    nodes.push(node)
    nodeById.set(tagId, node)
  }

  const clusters = new Set(
    pageEntries.map(([slug]) => {
      const [first] = slug.split("/")
      return first || "root"
    }),
  ).size

  return { nodes, nodeById, links, clusters }
}

function renderKnowledgeMap(root: HTMLElement) {
  const svgEl = root.querySelector<SVGSVGElement>(".km-graph")
  const wrap = root.querySelector<HTMLElement>(".km-canvas-wrap")
  if (!svgEl || !wrap) return () => {}
  const canvasWrap = wrap

  const controllers: AbortController[] = []
  const listen = (target: EventTarget, event: string, handler: EventListener) => {
    const controller = new AbortController()
    controllers.push(controller)
    target.addEventListener(event, handler, { signal: controller.signal })
  }

  let stopped = false
  let simulation = forceSimulation<MapNode>()

  fetchData.then((index: Record<FullSlug, ContentDetails>) => {
    if (stopped) return

    const { nodes, nodeById, links, clusters } = buildMapData(index)
    if (nodes.length === 0) return

    const firstNote = nodes.find((node) => node.kind === "note")
    const initial = nodeById.has("index" as SimpleSlug) ? ("index" as SimpleSlug) : firstNote!.id
    const state: MapState = {
      selected: initial,
      filter: "all",
      query: "",
      focus: { current: true, related: true, visited: true, tags: true, context: true },
      visited: getVisited(),
    }

    state.visited.add(initial)
    saveVisited(state.visited)

    const relatedFor = (id: SimpleSlug) => {
      const related = new Set<SimpleSlug>()
      for (const link of links) {
        const source = nodeId(link.source)
        const target = nodeId(link.target)
        if (source === id) related.add(target)
        if (target === id) related.add(source)
      }
      return related
    }

    const svg = select(svgEl)
    svg.selectAll("*").remove()
    const viewport = svg.append("g").attr("class", "km-viewport")
    const linkLayer = viewport.append("g").attr("class", "km-link-layer")
    const nodeLayer = viewport.append("g").attr("class", "km-node-layer")

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 3])
      .on("zoom", (event) => viewport.attr("transform", event.transform.toString()))

    svg.call(zoomBehavior)

    const linkSel = linkLayer
      .selectAll<SVGLineElement, MapLink>("line")
      .data(links)
      .join("line")
      .attr("class", (link) => `km-link km-link-${link.kind}`)

    const nodeSel = nodeLayer
      .selectAll<SVGGElement, MapNode>("g")
      .data(nodes)
      .join((enter) => {
        const group = enter.append("g").attr("class", "km-node").attr("tabindex", 0)
        group.append("circle").attr("class", "km-node-ring").attr("r", 30)
        group.append("circle").attr("class", "km-node-dot").attr("r", 22)
        group.append("rect").attr("class", "km-node-pill")
        group.append("text").attr("class", "km-node-label").attr("text-anchor", "middle")
        return group
      })
      .on("click", (_, node) => selectNode(node.id))
      .on("keydown", (event, node) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          selectNode(node.id)
        }
      })
      .call(
        drag<SVGGElement, MapNode>()
          .on("start", (event, node) => {
            if (!event.active) simulation.alphaTarget(0.22).restart()
            node.fx = node.x
            node.fy = node.y
          })
          .on("drag", (event, node) => {
            node.fx = event.x
            node.fy = event.y
          })
          .on("end", (event, node) => {
            if (!event.active) simulation.alphaTarget(0)
            node.fx = null
            node.fy = null
          }),
      )

    nodeSel.each(function (node) {
      const group = select(this)
      const label = node.kind === "tag" ? node.title.replace(/^#/, "") : node.title
      const pillWidth = Math.max(68, Math.min(180, label.length * 7 + 26))
      group
        .select<SVGCircleElement>(".km-node-dot")
        .style("display", node.kind === "note" ? "" : "none")
      group
        .select<SVGCircleElement>(".km-node-ring")
        .style("display", node.kind === "note" ? "" : "none")
      group
        .select<SVGRectElement>(".km-node-pill")
        .style("display", node.kind === "tag" ? "" : "none")
        .attr("x", -pillWidth / 2)
        .attr("y", -15)
        .attr("width", pillWidth)
        .attr("height", 30)
        .attr("rx", 15)
      group
        .select<SVGTextElement>(".km-node-label")
        .text(label)
        .attr("dy", node.kind === "tag" ? "0.36em" : "0.32em")
    })

    function visibleRole(node: MapNode, related: Set<SimpleSlug>) {
      if (node.id === state.selected) return "current"
      if (node.kind === "tag") return "tags"
      if (related.has(node.id)) return "related"
      if (state.visited.has(node.id)) return "visited"
      return "context"
    }

    function matchesFilter(node: MapNode) {
      const query = state.query
      const text = `${node.title} ${node.id} ${node.tags.join(" ")}`.toLowerCase()
      if (query && !text.includes(query)) return false
      if (state.filter === "notes" && node.kind !== "note") return false
      if (state.filter === "tags" && node.kind !== "tag") return false
      if (state.filter === "visited" && !state.visited.has(node.id)) return false
      return true
    }

    function updateStats() {
      root.querySelector<HTMLElement>('[data-stat="nodes"]')!.textContent = String(nodes.length)
      root.querySelector<HTMLElement>('[data-stat="edges"]')!.textContent = String(links.length)
      root.querySelector<HTMLElement>('[data-stat="clusters"]')!.textContent = String(clusters)
    }

    function updateFilters() {
      root.querySelectorAll<HTMLButtonElement>(".km-filter").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.filter === state.filter)
      })
    }

    function applyVisibility() {
      const related = relatedFor(state.selected)
      nodeSel
        .attr("class", (node) => `km-node is-${visibleRole(node, related)} is-${node.kind}`)
        .style("display", (node) => {
          const role = visibleRole(node, related)
          node.visible = state.focus[role] && matchesFilter(node)
          return node.visible ? null : "none"
        })

      linkSel.style("display", (link) => {
        const source = nodeById.get(nodeId(link.source))
        const target = nodeById.get(nodeId(link.target))
        return source?.visible && target?.visible ? null : "none"
      })

      updateFilters()
      updateStats()
    }

    function updateDetails(id: SimpleSlug) {
      const node = nodeById.get(id)
      if (!node) return

      root.querySelector<HTMLElement>('[data-detail="title"]')!.textContent = node.title
      root.querySelector<HTMLElement>('[data-detail="slug"]')!.textContent = node.id
      root.querySelector<HTMLElement>('[data-detail="summary"]')!.textContent =
        node.kind === "tag" ? `Notes tagged ${node.title}.` : excerpt(node.details)

      const tags = root.querySelector<HTMLElement>('[data-detail="tags"]')!
      tags.replaceChildren(
        ...(node.kind === "note" && node.tags.length > 0
          ? node.tags.map((tag) => {
              const chip = document.createElement("span")
              chip.textContent = tag
              return chip
            })
          : [document.createTextNode(node.kind === "tag" ? node.title : "No tags")]),
      )

      const relatedNotes = [...relatedFor(id)]
        .map((relatedId) => nodeById.get(relatedId))
        .filter((related): related is MapNode => related !== undefined && related.kind === "note")
        .slice(0, 6)

      const list = root.querySelector<HTMLElement>('[data-detail="related"]')!
      list.replaceChildren(
        ...(relatedNotes.length > 0
          ? relatedNotes.map((related) => {
              const item = document.createElement("li")
              const link = document.createElement("a")
              link.href = resolveRelative(mapSlug, related.id)
              link.textContent = related.title
              const summary = document.createElement("span")
              summary.textContent = excerpt(related.details)
              item.append(link, summary)
              return item
            })
          : [document.createTextNode("No directly related notes.")]),
      )

      const open = root.querySelector<HTMLAnchorElement>('[data-detail="open"]')!
      open.href = resolveRelative(mapSlug, node.id)
      open.toggleAttribute("hidden", node.kind !== "note")
    }

    function selectNode(id: SimpleSlug) {
      state.selected = id
      const node = nodeById.get(id)
      if (node?.kind === "note") {
        state.visited.add(id)
        saveVisited(state.visited)
      }
      updateDetails(id)
      applyVisibility()
    }

    function resize() {
      const width = Math.max(320, canvasWrap.clientWidth)
      const height = Math.max(360, canvasWrap.clientHeight)
      svg.attr("viewBox", `0 0 ${width} ${height}`)
      simulation.force("center", forceCenter(width / 2, height / 2))
      simulation.alpha(0.35).restart()
    }

    simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink<MapNode, MapLink>(links)
          .id((node) => node.id)
          .distance((link) => (link.kind === "tag" ? 140 : 180))
          .strength((link) => (link.kind === "tag" ? 0.35 : 0.65)),
      )
      .force("charge", forceManyBody().strength(-430))
      .force(
        "collide",
        forceCollide<MapNode>().radius((node) => (node.kind === "tag" ? 46 : 58)),
      )
      .on("tick", () => {
        linkSel
          .attr("x1", (link) => (link.source as MapNode).x ?? 0)
          .attr("y1", (link) => (link.source as MapNode).y ?? 0)
          .attr("x2", (link) => (link.target as MapNode).x ?? 0)
          .attr("y2", (link) => (link.target as MapNode).y ?? 0)

        nodeSel.attr("transform", (node) => `translate(${node.x ?? 0},${node.y ?? 0})`)
      })

    root.querySelectorAll<HTMLInputElement>("[data-focus]").forEach((input) => {
      state.focus[input.dataset.focus as FocusKey] = input.checked
      listen(input, "change", () => {
        state.focus[input.dataset.focus as FocusKey] = input.checked
        applyVisibility()
      })
    })

    root.querySelectorAll<HTMLButtonElement>(".km-filter").forEach((button) => {
      listen(button, "click", () => {
        state.filter = button.dataset.filter as FilterMode
        applyVisibility()
      })
    })

    root.querySelectorAll<HTMLInputElement>(".km-search-input").forEach((input) => {
      listen(input, "input", () => {
        state.query = input.value.trim().toLowerCase()
        applyVisibility()
      })
    })

    listen(root.querySelector(".km-zoom-in")!, "click", () => {
      svg.transition().duration(180).call(zoomBehavior.scaleBy, 1.2)
    })
    listen(root.querySelector(".km-zoom-out")!, "click", () => {
      svg.transition().duration(180).call(zoomBehavior.scaleBy, 0.82)
    })
    listen(root.querySelector(".km-fit")!, "click", () => {
      svg.transition().duration(180).call(zoomBehavior.transform, zoomIdentity)
    })
    listen(window, "resize", resize)

    resize()
    selectNode(initial)
  })

  return () => {
    stopped = true
    simulation.stop()
    controllers.forEach((controller) => controller.abort())
  }
}

function mountKnowledgeMap() {
  cleanupMap?.()
  const root = document.querySelector<HTMLElement>(".knowledge-map-shell")
  cleanupMap = root ? renderKnowledgeMap(root) : undefined
  if (cleanupMap && typeof window.addCleanup === "function") window.addCleanup(cleanupMap)
}

document.addEventListener("nav", mountKnowledgeMap)
mountKnowledgeMap()
