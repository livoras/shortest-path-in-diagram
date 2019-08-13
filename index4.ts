interface IRectangle {
  left: number,
  top: number,
  width: number,
  height: number,
}

interface IPoint {
  x: number,
  y: number,
}

interface ILine {
  from: IPoint,
  to: IPoint,
}

const enum Direction {
  TOP = "TOP",
  RIGHT = "RIGHT",
  BOTTOM = "BOTTOM",
  LEFT = "LEFT",
}

type Path = any[]

const TOP_RIGHT = [Direction.TOP, Direction.RIGHT]
const BOTTOM_LEFT = [Direction.BOTTOM, Direction.LEFT]
const TOP_LEFT = [Direction.TOP, Direction.LEFT]
const BOTTOM_RIGHT = [Direction.TOP, Direction.RIGHT]
const TOP_BOTTOM = [Direction.TOP, Direction.BOTTOM]

const isTopRight = (d: Direction): boolean => TOP_RIGHT.includes(d)
const isBottomLeft = (d: Direction): boolean => BOTTOM_LEFT.includes(d)
const isTopLeft = (d: Direction): boolean => TOP_LEFT.includes(d)
const isBottomRight = (d: Direction): boolean => BOTTOM_RIGHT.includes(d)
const isTopBottom = (d: Direction): boolean => TOP_BOTTOM.includes(d)

const PXNY = "PXNY"
const NXPY = "NXPY"

export const getShortestPath = (
  fromRect: IRectangle,
  fromPoint: IPoint,
  fromDirection: Direction,

  toRect: IRectangle,
  toPoint: IPoint,
  toDirection: Direction,
): Path => {
  const args: [IRectangle, IPoint, Direction, IRectangle, IPoint, Direction] =
    [fromRect, fromPoint, fromDirection, toRect, toPoint, toDirection]
  const path = isInverseDirection(fromDirection, toDirection)
    ? getPathByCenterStrategy(...args)
    : getPathBySingleInflectionStrategy(...args)
  if (path) { return path }
  return getPathByMovingPointStrategy(...args) || getPathBySingleInflectionForcelyStrategy(...args)
}

const isInverseDirection = (direction1: Direction, direction2: Direction): boolean => {
  return (direction1 === Direction.LEFT && direction2 === Direction.RIGHT) ||
    (direction1 === Direction.RIGHT && direction2 === Direction.LEFT) ||
    (direction1 === Direction.TOP && direction2 === Direction.BOTTOM) ||
    (direction1 === Direction.BOTTOM && direction2 === Direction.TOP)
}

const getPathByCenterStrategy = (
  fromRect: IRectangle,
  fromPoint: IPoint,
  fromDirection: Direction,

  toRect: IRectangle,
  toPoint: IPoint,
  toDirection: Direction,
): Path | null => {
  return null
}

const getPathBySingleInflectionStrategy = (
  fromRect: IRectangle,
  fromPoint: IPoint,
  fromDirection: Direction,

  toRect: IRectangle,
  toPoint: IPoint,
  toDirection: Direction,
): Path | null => {
  return null
}

const getPathBySingleInflectionForcelyStrategy = (
  fromRect: IRectangle,
  fromPoint: IPoint,
  fromDirection: Direction,

  toRect: IRectangle,
  toPoint: IPoint,
  toDirection: Direction,
): Path | null => {
  return null
}

const getPathByMovingPointStrategy = (
  fromRect: IRectangle,
  fromPoint: IPoint,
  fromDirection: Direction,

  toRect: IRectangle,
  toPoint: IPoint,
  toDirection: Direction,
): Path => {
  return null
}

const minPaths = (candidates: Path[]): Path => {
  let minIndex = 0
  let currentMin = -1
  candidates.forEach((path, i) => {
    let cost = 0
    for (let j = 1; j < path.length; j++) {
      const curr = path[j]
      const prev = path[j - 1]
      cost += (Math.abs(prev.x - curr.x) + Math.abs(prev.y - curr.y))
    }
    if (currentMin < 0 || cost < currentMin) {
      minIndex = i
      currentMin = cost
    }
  })
  return candidates[minIndex]
}

const processPath = (path: Path): Path => {
  path.forEach((point: any, i) => {
    if (point === PXNY) {
      path[i] = {
        x: path[i - 1].x,
        y: path[i + 1].y,
      }
    } else if (point === NXPY) {
      path[i] = {
        x: path[i + 1].x,
        y: path[i - 1].y,
      }
    }
  })
  return path
}

const p = processPath

const getRectPoints = (rect: IRectangle): IPoint[] => {
  const { left: x1, top: y1, width: w1, height: h1 } = rect
  const a = { x: x1, y: y1 }
  const b = { x: x1 + w1, y: y1 }
  const c = { x: x1 + w1, y: y1 + h1 }
  const d = { x: x1, y: y1 + h1 }
  return [a, b, c, d]
}

const ret = getShortestPath(
  { left: 0, top: 0, width: 10, height: 10 },
  { x: 5, y: 10 },
  // { left: 10, top: 10, width: 100, height: 100 },
  // { x: 10, y: 20 },
  // { x: 50, y: 10 },
  Direction.BOTTOM,

  { left: 12, top: 12, width: 10, height: 10 },
  { x: 18, y: 12 },
  // { x: 12, y: 15 },
  // { left: 130, top: 130, width: 50, height: 100 },
  // { x: 140, y: 230 },
  // { x: 180, y: 180 },
  Direction.TOP,
)

/** 判断横竖线是否相交 */
const isRegularLineIntersected = (l1: ILine, l2: ILine): boolean => {
  return isRegularSegmentIntersected(l1.from.x, l1.to.x, l2.from.x, l2.from.x) &&
    isRegularSegmentIntersected(l1.from.y, l1.to.y, l2.from.y, l2.from.y)
}

/** 判断分量是否相交 */
const isRegularSegmentIntersected = (a: number, b: number, c: number, d: number): boolean => {
  return isNumberBetween(a, c, d) || isNumberBetween(b, c, d)
}

/**
 * check x in (num1, num2) or x in (num2, num1)
 */
const isNumberBetween = (x, num1, num2): boolean => {
  return (x - num1) * (x - num2) < 0
}
