import Graph = require("node-dijkstra")

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

  const graph = new Graph()

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
      const currentPath = {}
      const currentPathName = `(${x},${y})`
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

        const tPathName = `(${tx},${ty})`
        // 中心点相关优先通过
        const isCenterX = tx === cross.x
        const isCenterY = ty === cross.y
        const isBetterPoint = isCenterX || isCenterY
        currentPath[tPathName] = Math.abs(tx - x) + Math.abs(ty - y) + (isBetterPoint ? -1 : 0)
      })
      graph.addNode(currentPathName, currentPath)
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

const dijkstraPathByGraph = (from: Point, to: Point, graph: Graph) => {
 return graph.path(`(${from.x},${from.y})`, `(${to.x},${to.y})`)
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
    { left: 10, top: 10, width: 100, height: 100 },
    // { x: 10, y: 20 },
    { x: 50, y: 10 },
    Direction.BOTTOM,

    { left: 130, top: 130, width: 50, height: 100 },
    // { x: 180, y: 180 },
    { x: 140, y: 230 },
    Direction.BOTTOM,
  )
}

console.time("time")
const path = test()
console.timeEnd("time")
console.log(path)
