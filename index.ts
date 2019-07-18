import PriorityQueue from "./lib/PriorityQueue"

type Graph = Map<string, Map<string, number>>
const INF_NUMBER = 999999999

interface Rectangle {
  left: number,
  top: number,
  width: number,
  height: number,
}

interface Point {
  x: number,
  y: number,
}

const enum Direction {
  UP = "UP",
  RIGHT = "RIGHT",
  BOTTOM = "BOTTOM",
  LEFT = "LEFT",
}

/** end point direction */
const enum E {
  A, B, C, D,
  E, F, G, H,
  I, J, K, L,
  M, N, O, P,
}

const enum I {
  /** inflection point */
  a, b, c, d, e,
  f, g, h, i, j,
  k, l, m, n, o,
  p, q, r, s, t,
  u, v, w, x, y,
  /** cross point with previous x and next y */
  pxny,
  /** cross point with next x and previous y */
  nxpy,
}

实际上只有三种情况：

1. 完全同向问题（非常简单）
2. 完全逆向问题（非常简单）
  1.1 有中点
  1.2 无中点
3. 其他向问题：转化为 1 和 2 问题后对比找到相对小的路径

const PATHS = {
  "A->M": [[[I.pxny]]],
  "A->N": [[[I.pxny, I.m, I.nxpy]], [[I.a, I.nxpy]]],
  "A->O": [[[I.pxny, I.m, I.nxpy]]],
  "A->P": [[[I.pxny]]],

  "B->M": [[[I.nxpy, I.m, I.pxny]], [[I.a, I.pxny]]],
  "B->N": [[[I.nxpy]]],
  "B->O": [[[I.nxpy]]],
  "B->P": [[[I.nxpy, I.m, I.pxny]], []],

  "C->M": [[], []],
  "C->N": [[], []],
  "C->O": [[], []],
  "C->P": [[], []],

  "D->M": [[], []],
  "D->N": [[], []],
  "D->O": [[], []],
  "D->P": [[], []],

  "E->I": [[], []],
  "E->J": [[], []],
  "E->K": [[], []],
  "E->L": [[], []],

  "F->I": [[], []],
  "F->J": [[], []],
  "F->K": [[], []],
  "F->L": [[], []],

  "G->I": [[], []],
  "G->J": [[], []],
  "G->K": [[], []],
  "G->L": [[], []],

  "H->I": [[], []],
  "H->J": [[], []],
  "H->K": [[], []],
  "H->L": [[], []],
}

export const getShortestPath = (
  fromRect: Rectangle,
  fromPoint: Point,
  fromDirection: Direction,

  toRect: Rectangle,
  toPoint: Point,
  toDirection: Direction,
) => {
  const [leftRect, rightRect] = fromRect.left < toRect.left ? [fromRect, toRect] : [toRect, fromRect]
  const isTopDown = leftRect.top > rightRect.top
  const [a, b, c, d] = getRectPoints(leftRect)
  const [e, f, g, h] = getRectPoints(rightRect)

  const topPoint = isTopDown ? a : f
  const bottomPoint = isTopDown ? g : d
  const centerLeftPoint = isTopDown ? c : b
  const centerRightPoint = isTopDown ? e : h

  const [centerTopPoint, centerBottomPoint] = isTopDown
    ? [centerRightPoint, centerLeftPoint]
    : [centerLeftPoint, centerRightPoint]

  const centerCrossPoint = {
    x: centerLeftPoint.x + (centerRightPoint.x - centerLeftPoint.x) / 2,
    y: centerTopPoint.y + (centerBottomPoint.y - centerTopPoint.y) / 2,
  }

  const crucialPoints = [
    fromPoint,
    toPoint,
    topPoint,
    bottomPoint,
    centerLeftPoint,
    centerRightPoint,
    centerCrossPoint,
  ]
  
  const graph = makeGraphByPoints(toRect, fromRect, crucialPoints, centerCrossPoint)
  return dijkstraPathByGraph(fromPoint, toPoint, graph)
}

const makeGraphByPoints = (rect1: Rectangle, rect2: Rectangle, points: Point[], cross: Point): Graph => {
  const xSet = Array.from(new Set(points.map(p => p.x * 1))).sort((a, b) => a - b)
  const ySet = Array.from(new Set(points.map(p => p.y * 1))).sort((a, b) => a - b)

  const map = Array
    .from({ length: xSet.length })
    .map(() => Array.from({ length: ySet.length }).fill(0))

  const graph = new Map<string, Map<string, number>>()

  const checkPointPass = (i: number, j: number): boolean => {
    const x = xSet[i]
    const y = ySet[j]
    const point = { x, y }
    /** 移除无用路径 */
    if (
      isPointInRect(point, rect1) ||
      isPointInRect(point, rect2)
    ) {
      map[i][j] = -1
      return false
    }
    map[i][j] = 1
    return true
  }

  xSet.forEach((x, i) => {
    ySet.forEach((y, j) => {
      if (!checkPointPass(i, j)) { return }
      const currentPath = new Map<string, number>()
      const currentPathName = `${x},${y}`
      const dist = [[0, -1], [1, 0], [0, 1], [-1, 0]]
      dist.forEach(([iDist, jDist]) => {
        const ip = i + iDist
        if (ip < 0 || ip >= xSet.length) { return }

        const jp = j + jDist
        if (jp < 0 || jp >= ySet.length || (iDist === 0 && jDist === 0)) { return }

        if (map[ip][jp] === 0) {
          checkPointPass(ip, jp)
        }

        if (map[ip][jp] === -1) {
          return
        }

        let tx = xSet[ip]
        let ty = ySet[jp]

        const center = { x: x + (tx - x) / 2, y: y + (ty - y) /2 }
        if (isPointInRect(center, rect1) || isPointInRect(center, rect2)) {
          return
        }

        const tPathName = `${tx},${ty}`
        // 中心点相关优先通过
        const isCenterX = tx === cross.x
        const isCenterY = ty === cross.y
        const isBetterPoint = isCenterX && isCenterY
        currentPath.set(tPathName, Math.abs(tx - x) + Math.abs(ty - y) + (isBetterPoint ? -1 : 0))
      })
      graph.set(currentPathName, currentPath)
    })
  })
  return graph
}

const isPointInRect = (point: Point, rect: Rectangle): boolean => {
  return point.x > rect.left &&
    point.y > rect.top &&
    point.x < (rect.left + rect.width) &&
    point.y < (rect.top + rect.height)
}

interface IPathCost {
  name: string,
  cost: number,
  direction: Direction,
  previous: IPathCost,
}

const dijkstraPathByGraph = (from: Point | string, to: Point | string, graph: Graph): string[] => {
  const candidatesQueue = new PriorityQueue()
  const queueCost = new Map<string, IPathCost>()
  const explored = new Set<string>()

  const fromName = typeof from === 'string' ? from : `${from.x},${from.y}`
  const toName = typeof to === 'string' ? to : `${to.x},${to.y}`
  graph.forEach((v, k) => candidatesQueue.add(k, INF_NUMBER))
  candidatesQueue.changePriority(fromName, 0)
  queueCost.set(fromName, { name: fromName, cost: 0, previous: null, direction: null })
  console.log(graph)

  while (!candidatesQueue.isEmpty()) {
    const min = candidatesQueue.poll()
    // console.log(min, '-->')
    // console.log(min, queueCost.get(min))
    const currentCost = queueCost.get(min)
    const neighbors = graph.get(min)
    // console.log(min, neighbors)
    if (neighbors) {
      neighbors.forEach((dist, neighborName) => {
        if (explored.has(neighborName)) { return }
        let cost = currentCost.cost + dist
        candidatesQueue.changePriority(neighborName, cost)
        let neighborCost: IPathCost
        if (!queueCost.has(neighborName)) {
          neighborCost = { name: neighborName, cost: INF_NUMBER, previous: null, direction: null }
          queueCost.set(neighborName, neighborCost)
        } else {
          neighborCost = queueCost.get(neighborName)
        }
        neighborCost.direction = getDirection(min, neighborName)
        // if (neighborCost.direction === currentCost.direction) {
        //   cost -= 2
        //   console.log("same direction...", min, '->', neighborName, cost)
        // }
        if (cost < neighborCost.cost) {
          neighborCost.cost = cost
          neighborCost.previous = currentCost
        }
      })
    }
    candidatesQueue.remove(min)
    explored.add(min)
    const minCostPath = queueCost.get(min)
    if (min === toName) {
      let node = minCostPath
      const path = []
      while (node) {
        path.push(node.name)
        node = node.previous
      }
      // console.log(queueCost)
      return path.reverse()
    }
  }
  return null
}

const getDirection = (name1: string, name2: string): Direction => {
  const n1 = name1.split(",").map(x => Number(x))
  const n2 = name2.split(",").map(x => Number(x))
  if (n1[0] === n2[0]) {
    if (n1[1] > n2[1]) {
      return Direction.UP
    } else {
      return Direction.BOTTOM
    }
  } else {
    if (n1[0] > n2[1]) {
      return Direction.LEFT
    } else {
      return Direction.RIGHT
    }
  }
  throw new Error("Not found.")
}

const getRectPoints = (rect: Rectangle): Point[] => {
  const { left: x1, top: y1, width: w1, height: h1 } = rect
  const a = { x: x1, y: y1 }
  const b = { x: x1 + w1, y: y1 }
  const c = { x: x1 + w1, y: y1 + h1 }
  const d = { x: x1, y: y1 + h1 }
  return [a, b, c, d]
}

const test = () => {
  return getShortestPath(
    { left: 0, top: 0, width: 10, height: 10 },
    { x: 5, y: 10 },
    // { left: 10, top: 10, width: 100, height: 100 },
    // { x: 10, y: 20 },
    // { x: 50, y: 10 },
    Direction.BOTTOM,

    { left: 12, top: 12, width: 10, height: 10 },
    { x: 12, y: 12 },
    // { left: 130, top: 130, width: 50, height: 100 },
    // { x: 140, y: 230 },
    // { x: 180, y: 180 },
    Direction.BOTTOM,
  )
}

const test2 = () => {
  const graph = new Map<string, Map<string, number>>()
  graph.set("A", new Map([
    ["B", 100],
    ["C", 10],
    ["E", 30]
  ]))
  graph.set("C", new Map([
    ["D", 50],
  ]))
  graph.set("D", new Map([
    ["B", 10],
  ]))
  graph.set("E", new Map([
    ["B", 60],
  ]))
  const path = dijkstraPathByGraph("A", "B", graph)
  return path
}

console.time("time")
const path = test()
console.timeEnd("time")
console.log(path)
