import { Direction } from "../interfaces"

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

type Path = IPoint[]

/**
 * 折线算法！
 * @param fromRect
 * @param fromPoint
 * @param fromDirection
 * @param toRect
 * @param toPoint
 * @param toDirection
 */
export const getShortestPathInDiagram = (
  fromRect: IRectangle,
  fromPoint: IPoint,
  fromDirection: Direction,

  toRect: IRectangle,
  toPoint: IPoint,
  toDirection: Direction,
): Path => {
  const args: [IRectangle, IPoint, Direction, IRectangle, IPoint, Direction] =
    [fromRect, fromPoint, fromDirection, toRect, toPoint, toDirection]
  /** 强制策略 */
  if (isPointInRect(fromPoint, toRect) || isPointInRect(toPoint, fromRect)) {
    return getPathBySingleInflectionForcelyStrategy(...args)
  }
  const path = isInverseDirection(fromDirection, toDirection)
    ? getPathByCenterStrategy(...args)
    : getPathBySingleInflectionStrategy(...args)
  if (path) { return path }
  return getPathByMovingPointStrategy(...args)
}

/** 判断是否两个方向完全  */
const isInverseDirection = (direction1: Direction, direction2: Direction): boolean => {
  return (direction1 === Direction.LEFT && direction2 === Direction.RIGHT) ||
    (direction1 === Direction.RIGHT && direction2 === Direction.LEFT) ||
    (direction1 === Direction.TOP && direction2 === Direction.BOTTOM) ||
    (direction1 === Direction.BOTTOM && direction2 === Direction.TOP)
}

/** 中心点策略 */
const getPathByCenterStrategy = (
  fromRect: IRectangle,
  fromPoint: IPoint,
  fromDirection: Direction,

  toRect: IRectangle,
  toPoint: IPoint,
  toDirection: Direction,
): Path | null => {

  /** 中心点 */
  const gapCenter = getGapCenterOfTwoRects(fromRect, toRect)

  /** 中心点在矩形内，没法穿过，移动两次使用 SIL */
  if (isPointInRect(gapCenter, fromRect) || isPointInRect(gapCenter, toRect)) {
    const fromMovingPoints = movingTwice(fromPoint, fromRect, fromDirection, toRect)
    const toMovingPoints = movingTwice(toPoint, toRect, toDirection, toRect)
    const newFromPoint = fromMovingPoints[1]
    const newToPoint = toMovingPoints[1]
    const fromSils = getSingleInflectionLinkOfTwoPoints(newFromPoint, toPoint)
    const toSils = getSingleInflectionLinkOfTwoPoints(fromPoint, newToPoint)
    return minPaths(
      [
        ...fromSils.map((sil) => [...fromMovingPoints, ...sil]),
        ...toSils.map((sil) => [...sil, ...toMovingPoints]),
      ],
    )
  }

  /** 水平情况 Path */
  const horizontalCenterPath = [
    fromPoint,
    { x: gapCenter.x, y: fromPoint.y },
    gapCenter,
    { x: gapCenter.x, y: toPoint.y },
    toPoint,
  ]

  /** 垂直情况 Path */
  const verticalCenterPath = [
    fromPoint,
    { x: fromPoint.x, y: gapCenter.y },
    gapCenter,
    { x: toPoint.x, y: gapCenter.y },
    toPoint,
  ]

  /** 看是否和矩形相交 */
  const validPaths = getValidPathsByRects([horizontalCenterPath, verticalCenterPath], fromRect, toRect)

  /** 如果没有合法路径 */
  if (validPaths.length === 0) {
    return null
  /** 如果只有一条直接返回 */
  } else if (validPaths.length === 1) {
    return validPaths[0]
  /** 如果有两条合法路径，看方向 */
  } else {
    if (fromDirection === Direction.LEFT || fromDirection === Direction.RIGHT) {
      return validPaths[0]
    } else {
      return validPaths[1]
    }
  }
}

/** SIL 策略 */
const getPathBySingleInflectionStrategy = (
  fromRect: IRectangle,
  fromPoint: IPoint,
  fromDirection: Direction,

  toRect: IRectangle,
  toPoint: IPoint,
  toDirection: Direction,
): Path | null => {
  const sils = getSingleInflectionLinkOfTwoPoints(fromPoint, toPoint)
  const validPaths = getValidPathsByRects(sils, fromRect, toRect)
  console.assert(validPaths.length <= 1, "单 SIL 模式，不应该返回多条合法路径")
  if (validPaths.length === 0) {
    return null
  } else {
    return validPaths[0]
  }
}

/** 无视矩形 SIL */
const getPathBySingleInflectionForcelyStrategy = (
  fromRect: IRectangle,
  fromPoint: IPoint,
  fromDirection: Direction,

  toRect: IRectangle,
  toPoint: IPoint,
  toDirection: Direction,
): Path => {
  const sils = getSingleInflectionLinkOfTwoPoints(fromPoint, toPoint)
  return minPaths(sils)
}

/** 平移以后单 SIL 策略 */
const getPathByMovingPointStrategy = (
  fromRect: IRectangle,
  fromPoint: IPoint,
  fromDirection: Direction,

  toRect: IRectangle,
  toPoint: IPoint,
  toDirection: Direction,
): Path | null => {
  const [f1, f2] = getMovingPoints(fromPoint, fromRect, fromDirection)
  const [t1, t2] = getMovingPoints(toPoint, toRect, toDirection)
  const headFrom = (path: Path): Path => [fromPoint, ...path]
  const tialTo = (path: Path): Path => [...path, toPoint]
  const singlePath = (from: IPoint, to: IPoint): Path => {
    return getValidPathsByRects(
      getSingleInflectionLinkOfTwoPoints(from, to),
      fromRect,
      toRect,
    )[0] || []
  }
  const paths = [
    headFrom(singlePath(f1, toPoint)),
    headFrom(singlePath(f2, toPoint)),
    tialTo(singlePath(fromPoint, t1)),
    tialTo(singlePath(fromPoint, t2)),
  ].filter((p) => p.length > 1)
  if (paths.length === 0) { return null }
  return minPaths(paths)
}

/** 获取一个点的平移以后的方向 */
const getMovingPoints = (point: IPoint, rect: IRectangle, direct: Direction): [IPoint, IPoint] => {
  const [a, b, c, d] = getRectPoints(rect)
  if (direct === Direction.TOP) {
    return [a, b]
  } else if (direct === Direction.RIGHT) {
    return [b, c]
  } else if (direct === Direction.BOTTOM) {
    return [c, d]
  } else {
    return [d, a]
  }
}

const movingTwice = (point: IPoint, rect: IRectangle, direct: Direction, rect2: IRectangle): Path => {
  // TODO
  return []
}

/** 判断路径是否和矩形都不相交 */
const getValidPathsByRects = (paths: Path[], rect1: IRectangle, rect2: IRectangle): Path[] => {
  return paths.filter((path) =>
    !isRegularPathIntersectedWithRect(path, rect1) &&
    !isRegularPathIntersectedWithRect(path, rect2),
  )
}

/** 获取两个点的两条 SIL */
const getSingleInflectionLinkOfTwoPoints = (p1: IPoint, p2: IPoint): Path[] => {
  return [
    [p1, { x: p2.x, y: p1.y }, p2], // 水平
    [p1, { x: p1.x, y: p2.y }, p2], // 垂直
  ]
}

/** 获取两个矩形的中心点 */
const getGapCenterOfTwoRects = (rect1: IRectangle, rect2: IRectangle): IPoint => {
  return {
    x: getCenterPointOfSegment(
      rect1.left,
      rect1.left + rect1.width,
      rect2.left,
      rect2.left + rect2.width,
    ),

    y: getCenterPointOfSegment(
      rect1.top,
      rect1.top + rect1.height,
      rect2.top,
      rect2.top + rect2.height,
    ),
  }
}

const getCenterPointOfSegment = (x1: number, x2: number, x3: number, x4: number): number => {
  const points = [x1, x2, x3, x4].sort((a, b) => a - b)
  return points[1] + (points[2] - points[1]) / 2
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

const simplifyPath = (path: Path): Path => {
  // TODO
  return []
}

const getRectPoints = (rect: IRectangle): IPoint[] => {
  const { left: x1, top: y1, width: w1, height: h1 } = rect
  const a = { x: x1, y: y1 }
  const b = { x: x1 + w1, y: y1 }
  const c = { x: x1 + w1, y: y1 + h1 }
  const d = { x: x1, y: y1 + h1 }
  return [a, b, c, d]
}

/** 判断路径是否和矩形相交 */
const isRegularPathIntersectedWithRect = (path: Path, rect: IRectangle): boolean => {
  for (let i = 0, len = path.length - 1; i < len; i++) {
    if (isRegularLineIntersectedWithRect({ from: path[i], to: path[i + 1] }, rect)) {
      return true
    }
  }
  return false
}

/**
 * 判断横竖线段和矩形是否相交
 */
const isRegularLineIntersectedWithRect = (l: ILine, rect: IRectangle): boolean => {
  if (isPointInRect(l.from, rect) || isPointInRect(l.to, rect)) {
    return true
  }
  const [a, b, c, d] = getRectPoints(rect)
  return isRegularLineIntersected(l, { from: a, to: b }) ||
    isRegularLineIntersected(l, { from: b, to: c }) ||
    isRegularLineIntersected(l, { from: c, to: d }) ||
    isRegularLineIntersected(l, { from: d, to: a })
}

const isPointInRect = (point: IPoint, rect: IRectangle): boolean => {
  return point.x > rect.left &&
    point.y > rect.top &&
    point.x < (rect.left + rect.width) &&
    point.y < (rect.top + rect.height)
}

/** 判断横竖线是否相交 */
const isRegularLineIntersected = (l1: ILine, l2: ILine): boolean => {
  const ret1 = isRegularSegmentIntersected(l1.from.x, l1.to.x, l2.from.x, l2.to.x)
  const ret2 = isRegularSegmentIntersected(l1.from.y, l1.to.y, l2.from.y, l2.to.y)
  return ret1 && ret2
}

/** 判断分量是否相交 */
const isRegularSegmentIntersected = (a: number, b: number, c: number, d: number): boolean => {
  return isNumberBetween(a, c, d) || isNumberBetween(b, c, d) || isNumberBetween(c, a, b) || isNumberBetween(d, a, b)
}

/**
 * check x in (num1, num2) or x in (num2, num1)
 */
const isNumberBetween = (x: number, num1: number, num2: number): boolean => {
  return (x - num1) * (x - num2) < 0
}

// const ret = getShortestPath(
//   { left: 0, top: 0, width: 10, height: 10 },
//   { x: 5, y: 10 },
//   // { left: 10, top: 10, width: 100, height: 100 },
//   // { x: 10, y: 20 },
//   // { x: 50, y: 10 },
//   Direction.BOTTOM,

//   { left: 12, top: 12, width: 10, height: 10 },
//   { x: 18, y: 12 },
//   // { x: 12, y: 15 },
//   // { left: 130, top: 130, width: 50, height: 100 },
//   // { x: 140, y: 230 },
//   // { x: 180, y: 180 },
//   Direction.TOP,
// )

// const ret = getShortestPath(
//   { left: 0, top: 0, width: 10, height: 10 },
//   { x: 0, y: 2 },
//   // { left: 10, top: 10, width: 100, height: 100 },
//   // { x: 10, y: 20 },
//   // { x: 50, y: 10 },
//   Direction.LEFT,

//   { left: 12, top: 12, width: 10, height: 10 },
//   { x: 18, y: 12 },
//   // { x: 12, y: 15 },
//   // { left: 130, top: 130, width: 50, height: 100 },
//   // { x: 140, y: 230 },
//   // { x: 180, y: 180 },
//   Direction.TOP,
// )

// const ret = getShortestPathInDiagram(
//   { left: 0, top: 0, width: 5, height: 5 },
//   { x: 5, y: 0 },
//   // { left: 10, top: 10, width: 100, height: 100 },
//   // { x: 10, y: 20 },
//   // { x: 50, y: 10 },
//   Direction.TOP,

//   { left: 8, top: 8, width: 10, height: 10 },
//   { x: 10, y: 18 },
//   // { x: 12, y: 15 },
//   // { left: 130, top: 130, width: 50, height: 100 },
//   // { x: 140, y: 230 },
//   // { x: 180, y: 180 },
//   Direction.BOTTOM,
// )

// console.log(ret)
