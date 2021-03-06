import { Direction } from "../interfaces"

interface IRectangle {
  left: number,
  top: number,
  width: number,
  height: number,
}

export interface IPoint {
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
  let path: Path
  if (isPointInRect(fromPoint, toRect) || isPointInRect(toPoint, fromRect)) {
    path = getPathBySingleInflectionForcelyStrategy(...args)
  } else {
    path = isInverseDirection(fromDirection, toDirection)
      ? getPathByCenterStrategy(...args)
      : getPathBySingleInflectionStrategy(...args)
  }
  path = path || getPathByMovingPointStrategy(...args)
  return simplifyPath(path)
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
    const toMovingPoints = movingTwice(toPoint, toRect, toDirection, fromRect)
    const newFromPoint = fromMovingPoints[2]
    const newToPoint = toMovingPoints[2]
    const fromSils = getSingleInflectionLinkOfTwoPoints(newFromPoint, toPoint)
    const toSils = getSingleInflectionLinkOfTwoPoints(fromPoint, newToPoint)
    return minPaths(
      getValidPathsByRects(
        [
          ...fromSils.map((sil) => [...fromMovingPoints, ...sil.slice(1)]),
          ...toSils.map((sil) => [...sil, ...toMovingPoints.slice(1)]),
        ],
        fromRect,
        toRect,
      ),
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
  const paths = getValidPathsByRects(sils, fromRect, toRect)

  let path: Path
  if (paths.length === 0) {
    return null
  } else if (paths.length === 1) {
    path = paths[0]
  } else {
    /** 多条路径只用方向相同的 */
    const p1 = paths[0]
    const p2 = paths[1]
    const direction = getDirectionByTwoPoints(p1[0], p1[1])
    path = direction === fromDirection ? p1 : p2
  }
  return path
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
  const tailTo = (path: Path): Path => [...path, toPoint]
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
    tailTo(singlePath(fromPoint, t1)),
    tailTo(singlePath(fromPoint, t2)),
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
  const nextPairTwoPoints: Path[] = []
  const [a, b, c, d] = getRectPoints(rect)
  if (direct === Direction.TOP) {
    nextPairTwoPoints.push([a, d])
    nextPairTwoPoints.push([b, c])
  } else if (direct === Direction.RIGHT) {
    nextPairTwoPoints.push([b, a])
    nextPairTwoPoints.push([c, d])
  } else if (direct === Direction.BOTTOM) {
    nextPairTwoPoints.push([c, b])
    nextPairTwoPoints.push([d, a])
  } else {
    nextPairTwoPoints.push([a, b])
    nextPairTwoPoints.push([d, c])
  }
  const paths = nextPairTwoPoints.filter((p: Path) => {
    return !isPointInRect(p[0], rect2) && !isPointInRect(p[1], rect2)
  })
  console.assert(paths.length === 1, "平移两次应该只有一条合法路径")
  const path = paths[0]
  return [point, ...path]
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

const getDirectionByTwoPoints = (p1: IPoint, p2: IPoint): Direction => {
  if (p1.x === p2.x) {
    return p2.y < p1.y ? Direction.TOP : Direction.BOTTOM
  }

  if (p1.y === p2.y) {
    return p2.x < p1.x ? Direction.LEFT : Direction.RIGHT
  }

  throw new Error("获取两点方向只适用于标准横竖线")
}

export const simplifyPath = (path: Path): Path => {
  const newPath = []
  path.forEach((point: IPoint) => {
    const pp1 = newPath[newPath.length - 1]
    const pp2 = newPath[newPath.length - 2]
    if (isSamePoint(pp1, point)) {
      return
    }
    if (isSamePoint(pp2, point)) {
      newPath.pop()
      return
    }
    newPath.push(point)
  })
  return newPath
}

const isSamePoint = (p1: IPoint, p2: IPoint): boolean => {
  if (!p1 || !p2) { return false }
  // tslint:disable-next-line: no-bitwise
  return ~~p1.x === ~~p2.x && ~~p1.y === ~~p2.y
}

const getRectPoints = (rect: IRectangle): IPoint[] => {
  const { left: x1, top: y1, width: w1, height: h1 } = rect
  const a = { x: x1, y: y1 }
  const b = { x: x1 + w1, y: y1 }
  const c = { x: x1 + w1, y: y1 + h1 }
  const d = { x: x1, y: y1 + h1 }
  return [a, b, c, d]
}

// num / 2
// tslint:disable-next-line: no-bitwise
const half = (num: number): number => num - (num >> 1)

const getRectCrossLines = (rect: IRectangle): [ILine, ILine] => {
  const mw = rect.left + half(rect.width)
  const mh = rect.top + half(rect.height)
  const x = rect.left
  const y = rect.top
  return [{
    from: { x: mw, y },
    to: { x: mw, y: y + rect.height },
  }, {
    from: { x, y: mh },
    to: { x: x + rect.width, y: mh },
  }]
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
  const [c1, c2] = getRectCrossLines(rect)
  return isRegularLineIntersected(l, c1) || isRegularLineIntersected(l, c2)
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
