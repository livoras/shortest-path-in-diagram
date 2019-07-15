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

  let crossPoints = getAllCrossPointsByPoints(
    fromPoint,
    toPoint,
    topPoint,
    bottomPoint,
    centerLeftPoint,
    centerRightPoint,
    centerCrossPoint,
  )
  
  crossPoints = removeOverlapPoints(crossPoints, fromRect)
  crossPoints = removeOverlapPoints(crossPoints, toRect)
  const routerTable = makeRouterTableByPoints(crossPoints)
  return dijkstraPathByRouterTable(fromPoint, toPoint, routerTable)
}

const getAllCrossPointsByPoints = (...points: Point[]): Point[] => {
  const xSet = new Set(points.map(p => p.x))
  const ySet = new Set(points.map(p => p.y))
  const ret: Point[] = []
  xSet.forEach((x) => {
    ySet.forEach((y) => {
      ret.push({ x, y })
    })
  })
  return ret
}

const removeOverlapPoints = (points: Point[], rect1: Rectangle): Point[] => {
  const ret: Point[] = []
  points.forEach((p: Point) => {
    if (!isPointInRect(p, rect1)) {
      ret.push(p)
    }
  })
  return ret
}

const isPointInRect = (point: Point, rect: Rectangle): boolean => {
  return point.x > rect.left &&
    point.y > rect.top &&
    point.x < (rect.left + rect.width) &&
    point.y < (rect.top + rect.height)
}

const makeRouterTableByPoints = (points: Point[]) => {
  // TODO
}

const dijkstraPathByRouterTable = (from: Point, to: Point, routerTable) => {
  // TODO
}

const getRectPoints = (rect: Rectangle): Point[] => {
  const { left: x1, top: y1, width: w1, height: h1 } = rect
  const a = { x: x1, y: y1 }
  const b = { x: x1 + w1, y: y1 }
  const c = { x: x1 + w1, y: y1 + h1 }
  const d = { x: x1, y: y1 + h1 }
  return [a, b, c, d]
}
