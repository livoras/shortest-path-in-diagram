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

export const getShortestPathRaw = (
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

  // const topPoint = isTopDown ? a : f
  // const bottomPoint = isTopDown ? g : d
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

  const isFromPointOnLeft = fromPoint.x < toPoint.x
  const isFromPointOnTop = fromPoint.y < toPoint.y

  /** 所有情况都适用的两端 */
  if (
    (isTopDown && isTopRight(fromDirection) && isTopRight(toDirection))
  ) {
    const mid = isFromPointOnLeft ? NXPY : PXNY
    return p([fromPoint, mid, toPoint])
  }

  if (
    (isTopDown && isBottomLeft(fromDirection) && isBottomLeft(toDirection))
  ) {
    const mid = isFromPointOnLeft ? PXNY : NXPY
    return p([fromPoint, mid, toPoint])
  }

  if (
    (!isTopDown && isTopLeft(fromDirection) && isTopLeft(toDirection))
  ) {
    const mid = isFromPointOnLeft ? PXNY : NXPY
    return p([fromPoint, mid, toPoint])
  }

  if (
    (!isTopDown && isBottomRight(fromDirection) && isBottomRight(toDirection))
  ) {
    const mid = isFromPointOnLeft ? NXPY : PXNY
    return p([fromPoint, mid, toPoint])
  }

  /** ===================== 需要经过水平的中线的情况 ================================ */
  if (
    isTopDown &&
    (isFromPointOnLeft && isBottomLeft(fromDirection) && isTopRight(toDirection)) ||
    (!isFromPointOnLeft && isBottomLeft(toDirection) && isTopRight(fromDirection))
  ) {
    if (hasHorizentalGap) {
      return p([fromPoint, PXNY, centerCrossPoint, NXPY, toPoint])
    } else {
      if (hasVerticalGap)  {
        const inf1: IPoint = isFromPointOnLeft ? c : e
        const inf2: IPoint = isFromPointOnLeft ? e : c
        return p([fromPoint, PXNY, inf1, NXPY, centerCrossPoint, PXNY, inf2, NXPY, toPoint])
      } else {
        const candidates = []
        // left -> top
        // left -> right
        if (
          fromDirection === Direction.LEFT &&
          (toDirection === Direction.TOP || toDirection === Direction.RIGHT)
        ) {
          candidates.push(p([fromDirection, a, NXPY, toDirection]))
          candidates.push(p([fromDirection, PXNY, g, PXNY, toDirection]))
        }

        // bottom -> top
        // bottom -> right
        if (
          fromDirection === Direction.BOTTOM &&
          (toDirection === Direction.TOP || toDirection === Direction.RIGHT)
        ) {
          candidates.push(p([fromDirection, d, a, NXPY, toDirection]))
          candidates.push(p([fromDirection, PXNY, g, PXNY, toDirection]))
        }

        // top -> left
        // top -> bottom
        if (
          fromDirection === Direction.TOP &&
          (toDirection === Direction.LEFT || toDirection === Direction.BOTTOM)
        ) {
          candidates.push(p([fromDirection, NXPY, a, PXNY, toDirection]))
          candidates.push(p([fromDirection, f, g, NXPY, toDirection]))
        }

        // right -> left
        // right -> bottom
        if (
          fromDirection === Direction.RIGHT &&
          (toDirection === Direction.LEFT || toDirection === Direction.BOTTOM)
        ) {
          candidates.push(p([fromDirection, g, NXPY, toDirection]))
          candidates.push(p([fromDirection, NXPY, a, PXNY, toDirection]))
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
      return p([fromPoint, PXNY, centerCrossPoint, NXPY, toPoint])
    } else {
      if (hasVerticalGap)  {
        const inf1: IPoint = isFromPointOnLeft ? b : h
        const inf2: IPoint = isFromPointOnLeft ? h : b
        return p([fromPoint, PXNY, inf1, NXPY, centerCrossPoint, PXNY, inf2, NXPY, toPoint])
      } else {
        const candidates = []
        // top -> bottom
        // top -> right
        if (
          fromDirection === Direction.TOP &&
          (toDirection === Direction.BOTTOM || toDirection === Direction.RIGHT)
        ) {
          candidates.push(p([fromDirection, PXNY, f, PXNY, toDirection]))
          candidates.push(p([fromDirection, NXPY, d, NXPY, toDirection]))
        }

        // left -> bottom
        // left -> right
        if (
          fromDirection === Direction.LEFT &&
          (toDirection === Direction.BOTTOM || toDirection === Direction.RIGHT)
        ) {
          candidates.push(p([fromDirection, PXNY, f, PXNY, toDirection]))
          candidates.push(p([fromDirection, d, NXPY, toDirection]))
        }

        // bottom -> top
        // bottom -> left
        if (
          fromDirection === Direction.BOTTOM &&
          (toDirection === Direction.TOP || toDirection === Direction.LEFT)
        ) {
          candidates.push(p([fromDirection, g, f, NXPY, toDirection]))
          candidates.push(p([fromDirection, PXNY, d, PXNY, toDirection]))
        }

        // right -> top
        // right -> left
        if (
          fromDirection === Direction.RIGHT &&
          (toDirection === Direction.TOP || toDirection === Direction.LEFT)
        ) {
          candidates.push(p([fromDirection, PXNY, e, NXPY, toDirection]))
          candidates.push(p([fromDirection, PXNY, d, PXNY, toDirection]))
        }
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
        return p([fromPoint, NXPY, inf1, PXNY, centerCrossPoint, NXPY, inf2, PXNY, toPoint])
      } else {
        const candidates = []
        // top -> bottom
        // top -> left
        if (
          fromDirection === Direction.TOP &&
          (toDirection === Direction.BOTTOM || toDirection === Direction.LEFT)
        ) {
          candidates.push(p([fromDirection, NXPY, g, NXPY, toDirection]))
          candidates.push(p([fromDirection, NXPY, d, PXNY, toDirection]))
        }

        // right -> bottom
        // right -> left
        if (
          fromDirection === Direction.RIGHT &&
          (toDirection === Direction.BOTTOM || toDirection === Direction.LEFT)
        ) {
          candidates.push(p([fromDirection, NXPY, g, NXPY, toDirection]))
          candidates.push(p([fromDirection, b, NXPY, d, PXNY, toDirection]))
        }

        // bottom -> top
        // bottom -> right
        if (
          fromDirection === Direction.BOTTOM &&
          (toDirection === Direction.TOP || toDirection === Direction.RIGHT)
        ) {
          candidates.push(p([fromDirection, NXPY, f, PXNY, toDirection]))
          candidates.push(p([fromDirection, NXPY, a, NXPY, toDirection]))
        }

        // left -> top
        // left -> right
        if (
          fromDirection === Direction.LEFT &&
          (toDirection === Direction.TOP || toDirection === Direction.RIGHT)
        ) {
          candidates.push(p([fromDirection, NXPY, a, NXPY, toDirection]))
          candidates.push(p([fromDirection, PXNY, g, PXNY, toDirection]))
        }

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
      return p([fromPoint, NXPY, centerCrossPoint, PXNY, toPoint])
    } else {
      if (hasHorizentalGap)  {
        const inf1 = isFromPointOnTop ? h : b
        const inf2 = isFromPointOnTop ? b : h
        return p([fromPoint, NXPY, inf1, PXNY, centerCrossPoint, NXPY, inf2, PXNY, toPoint])
      } else {
        const candidates = []
        // top -> bottom
        // top -> right
        if (
          fromDirection === Direction.TOP &&
          (toDirection === Direction.BOTTOM || toDirection === Direction.RIGHT)
        ) {
          candidates.push(p([fromDirection, NXPY, g, PXNY, toDirection]))
          candidates.push(p([fromDirection, NXPY, d, NXPY, toDirection]))
        }

        // left -> bottom
        // left -> right
        if (
          fromDirection === Direction.LEFT &&
          (toDirection === Direction.BOTTOM || toDirection === Direction.RIGHT)
        ) {
          candidates.push(p([fromDirection, e, f, PXNY, toDirection]))
          candidates.push(p([fromDirection, NXPY, d, NXPY, toDirection]))
        }

        // bottom -> top
        // bottom -> left
        if (
          fromDirection === Direction.BOTTOM &&
          (toDirection === Direction.TOP || toDirection === Direction.LEFT)
        ) {
          candidates.push(p([fromDirection, d, a, PXNY, toDirection]))
          candidates.push(p([fromDirection, NXPY, f, NXPY, toDirection]))
        }

        // right -> top
        // right - > left
        if (
          fromDirection === Direction.RIGHT &&
          (toDirection === Direction.TOP || toDirection === Direction.LEFT)
        ) {
          candidates.push(p([fromDirection, c, d, PXNY, toDirection]))
          candidates.push(p([fromDirection, NXPY, f, NXPY, toDirection]))
        }
        return minPaths(candidates)
      }
    }
  }
}

const minPaths = (candidates: Path[]): Path => {
  return []
}

const processPath = (path: Path): Path => {
  // TODO
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
