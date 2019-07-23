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
  const [leftRect, rightRect] = fromRect.left < toRect.left ? [fromRect, toRect] : [toRect, fromRect]
  const isTopDown = leftRect.top < rightRect.top

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

  let hasVerticalGap: boolean
  let hasHorizentalGap: boolean

  if (isTopDown) {
    hasHorizentalGap = (leftRect.top + leftRect.height) < rightRect.top
  } else {
    hasHorizentalGap = (rightRect.top + rightRect.height) < leftRect.top
  }
  hasVerticalGap = (leftRect.left + leftRect.width) < rightRect.left

  /** 所有情况都适用的两端 */
  if (
    (isTopDown && isTopRight(fromDirection) && isTopRight(toDirection))
  ) {
    const mid = fromPoint.x < toPoint.x ? NXPY : PXNY
    return [fromPoint, mid, toPoint]
  }

  if (
    (isTopDown && isBottomLeft(fromDirection) && isBottomLeft(toDirection))
  ) {
    const mid = fromPoint.x < toPoint.x ? PXNY : NXPY
    return [fromPoint, mid, toPoint]
  }

  if (
    (!isTopDown && isTopLeft(fromDirection) && isTopLeft(toDirection))
  ) {
    const mid = fromPoint.x < toPoint.x ? PXNY : NXPY
    return [fromPoint, mid, toPoint]
  }

  if (
    (!isTopDown && isBottomRight(fromDirection) && isBottomRight(toDirection))
  ) {
    const mid = fromPoint.x < toPoint.x ? NXPY : PXNY
    return [fromPoint, mid, toPoint]
  }

  const isFromPointOnLeft = fromPoint.x < toPoint.x
  const isFromPointOnTop = fromPoint.y < toPoint.y

  /** ===================== 需要经过水平的中线的情况 ================================ */
  if (
    isTopDown &&
    (isFromPointOnLeft && isBottomLeft(fromDirection) && isTopRight(toDirection)) ||
    (!isFromPointOnLeft && isBottomLeft(toDirection) && isTopRight(fromDirection))
  ) {
    if (hasHorizentalGap) {
      return [fromPoint, PXNY, centerCrossPoint, NXPY, toPoint]
    } else {
      if (hasVerticalGap)  {
        const inf1: IPoint = isFromPointOnLeft ? c : e
        const inf2: IPoint = isFromPointOnLeft ? e : c
        return [fromPoint, PXNY, inf1, NXPY, centerCrossPoint, PXNY, inf2, NXPY, toPoint]
      } else {
        const candidates = []
        // left -> top
        // left -> right
        if (
          fromDirection === Direction.LEFT &&
          (toDirection === Direction.TOP || toDirection === Direction.RIGHT)
        ) {
          candidates.push([fromDirection, a, NXPY, toDirection])
          candidates.push([fromDirection, PXNY, h, g, PXNY, toDirection])
        }

        // bottom -> top
        // bottom -> right
        if (
          fromDirection === Direction.BOTTOM &&
          (toDirection === Direction.TOP || toDirection === Direction.RIGHT)
        ) {
          candidates.push([fromDirection, d, a, NXPY, toDirection])
          candidates.push([fromDirection, PXNY, h, g, PXNY, toDirection])
        }

        // top -> left
        // top -> bottom
        if (
          fromDirection === Direction.TOP &&
          (toDirection === Direction.LEFT || toDirection === Direction.BOTTOM)
        ) {
          candidates.push([fromDirection, NXPY, b, a, PXNY, toDirection])
          candidates.push([fromDirection, f, g, NXPY, toDirection])
        }

        // right -> left
        // right -> bottom
        if (
          fromDirection === Direction.RIGHT &&
          (toDirection === Direction.LEFT || toDirection === Direction.BOTTOM)
        ) {
          candidates.push([fromDirection, g, NXPY, toDirection])
          candidates.push([fromDirection, NXPY, b, a, PXNY, toDirection])
        }

        return minPaths(candidates)
      }
    }
  }

  if (
    !isTopDown &&
    (isFromPointOnLeft && isTopLeft(fromDirection) && isBottomRight(toDirection)) ||
    (!isFromPointOnLeft && isTopLeft(toDirection) && isBottomRight(fromDirection))
  ) {
    if (hasHorizentalGap) {
      return [fromPoint, PXNY, centerCrossPoint, NXPY, toPoint]
    } else {
      if (hasVerticalGap)  {
        const inf1: IPoint = isFromPointOnLeft ? b : h
        const inf2: IPoint = isFromPointOnLeft ? h : b
        return [fromPoint, PXNY, inf1, NXPY, centerCrossPoint, PXNY, inf2, NXPY, toPoint]
      } else {
        const candidates = []
        // top -> bottom

        // top -> right

        // left -> bottom

        // left -> right

        // bottom -> top

        // bottom -> left

        // right -> top

        // right -> left
        return minPaths(candidates)
      }
    }
  }

  /** ===================== 需要经过垂直的中线的情况 ================================ */
  if (
    isTopDown &&
    (isFromPointOnTop && isTopRight(fromDirection) && isBottomLeft(toDirection)) ||
    (!isFromPointOnTop && isTopRight(toDirection) && isBottomLeft(fromDirection))
  ) {
    if (hasVerticalGap) {
      return [fromPoint, NXPY, centerCrossPoint, PXNY, toPoint]
    } else {
      if (hasHorizentalGap)  {
        const inf1 = isFromPointOnTop ? c : e
        const inf2 = isFromPointOnTop ? e : c
        return [fromPoint, NXPY, inf1, PXNY, centerCrossPoint, NXPY, inf2, PXNY, toPoint]
      } else {
        const candidates = []
        // top -> bottom

        // top -> left

        // right -> bottom

        // right -> left

        // bottom -> top

        // bottom -> right

        // left -> top

        // left -> right
        return minPaths(candidates)
      }
    }
  }

  if (
    !isTopDown &&
    (isFromPointOnTop && isTopLeft(fromDirection) && isBottomRight(toDirection)) ||
    (!isFromPointOnTop && isTopLeft(toDirection) && isBottomRight(fromDirection))
  ) {
    if (hasVerticalGap) {
      return [fromPoint, NXPY, centerCrossPoint, PXNY, toPoint]
    } else {
      if (hasHorizentalGap)  {
        const inf1 = isFromPointOnTop ? h : b
        const inf2 = isFromPointOnTop ? b : h
        return [fromPoint, NXPY, inf1, PXNY, centerCrossPoint, NXPY, inf2, PXNY, toPoint]
      } else {
        const candidates = []
        // top -> bottom

        // top -> right

        // left -> bottom

        // left -> right

        // bottom -> top

        // bottom -> left

        // right -> top

        // right - > left
        return minPaths(candidates)
      }
    }
  }
}

const minPaths = (candidates: Path[]): Path => {
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
