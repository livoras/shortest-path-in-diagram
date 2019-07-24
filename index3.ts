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
          candidates.push(p([fromPoint, a, NXPY, toPoint]))
          candidates.push(p([fromPoint, PXNY, g, PXNY, toPoint]))
        }

        // bottom -> top
        // bottom -> right
        if (
          fromDirection === Direction.BOTTOM &&
          (toDirection === Direction.TOP || toDirection === Direction.RIGHT)
        ) {
          candidates.push(p([fromPoint, d, a, NXPY, toPoint]))
          candidates.push(p([fromPoint, PXNY, g, PXNY, toPoint]))
        }

        // top -> left
        // top -> bottom
        if (
          fromDirection === Direction.TOP &&
          (toDirection === Direction.LEFT || toDirection === Direction.BOTTOM)
        ) {
          candidates.push(p([fromPoint, NXPY, a, PXNY, toPoint]))
          candidates.push(p([fromPoint, f, g, NXPY, toPoint]))
        }

        // right -> left
        // right -> bottom
        if (
          fromDirection === Direction.RIGHT &&
          (toDirection === Direction.LEFT || toDirection === Direction.BOTTOM)
        ) {
          candidates.push(p([fromPoint, g, NXPY, toPoint]))
          candidates.push(p([fromPoint, NXPY, a, PXNY, toPoint]))
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
          candidates.push(p([fromPoint, PXNY, f, PXNY, toPoint]))
          candidates.push(p([fromPoint, NXPY, d, NXPY, toPoint]))
        }

        // left -> bottom
        // left -> right
        if (
          fromDirection === Direction.LEFT &&
          (toDirection === Direction.BOTTOM || toDirection === Direction.RIGHT)
        ) {
          candidates.push(p([fromPoint, PXNY, f, PXNY, toPoint]))
          candidates.push(p([fromPoint, d, NXPY, toPoint]))
        }

        // bottom -> top
        // bottom -> left
        if (
          fromDirection === Direction.BOTTOM &&
          (toDirection === Direction.TOP || toDirection === Direction.LEFT)
        ) {
          candidates.push(p([fromPoint, g, f, NXPY, toPoint]))
          candidates.push(p([fromPoint, PXNY, d, PXNY, toPoint]))
        }

        // right -> top
        // right -> left
        if (
          fromDirection === Direction.RIGHT &&
          (toDirection === Direction.TOP || toDirection === Direction.LEFT)
        ) {
          candidates.push(p([fromPoint, PXNY, e, NXPY, toPoint]))
          candidates.push(p([fromPoint, PXNY, d, PXNY, toPoint]))
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
          candidates.push(p([fromPoint, NXPY, g, NXPY, toPoint]))
          candidates.push(p([fromPoint, NXPY, d, PXNY, toPoint]))
        }

        // right -> bottom
        // right -> left
        if (
          fromDirection === Direction.RIGHT &&
          (toDirection === Direction.BOTTOM || toDirection === Direction.LEFT)
        ) {
          candidates.push(p([fromPoint, NXPY, g, NXPY, toPoint]))
          candidates.push(p([fromPoint, b, NXPY, d, PXNY, toPoint]))
        }

        // bottom -> top
        // bottom -> right
        if (
          fromDirection === Direction.BOTTOM &&
          (toDirection === Direction.TOP || toDirection === Direction.RIGHT)
        ) {
          candidates.push(p([fromPoint, NXPY, f, PXNY, toPoint]))
          candidates.push(p([fromPoint, NXPY, a, NXPY, toPoint]))
        }

        // left -> top
        // left -> right
        if (
          fromDirection === Direction.LEFT &&
          (toDirection === Direction.TOP || toDirection === Direction.RIGHT)
        ) {
          candidates.push(p([fromPoint, NXPY, a, NXPY, toPoint]))
          candidates.push(p([fromPoint, PXNY, g, PXNY, toPoint]))
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
          candidates.push(p([fromPoint, NXPY, g, PXNY, toPoint]))
          candidates.push(p([fromPoint, NXPY, d, NXPY, toPoint]))
        }

        // left -> bottom
        // left -> right
        if (
          fromDirection === Direction.LEFT &&
          (toDirection === Direction.BOTTOM || toDirection === Direction.RIGHT)
        ) {
          candidates.push(p([fromPoint, e, f, PXNY, toPoint]))
          candidates.push(p([fromPoint, NXPY, d, NXPY, toPoint]))
        }

        // bottom -> top
        // bottom -> left
        if (
          fromDirection === Direction.BOTTOM &&
          (toDirection === Direction.TOP || toDirection === Direction.LEFT)
        ) {
          candidates.push(p([fromPoint, d, a, PXNY, toPoint]))
          candidates.push(p([fromPoint, NXPY, f, NXPY, toPoint]))
        }

        // right -> top
        // right - > left
        if (
          fromDirection === Direction.RIGHT &&
          (toDirection === Direction.TOP || toDirection === Direction.LEFT)
        ) {
          candidates.push(p([fromPoint, c, d, PXNY, toPoint]))
          candidates.push(p([fromPoint, NXPY, f, NXPY, toPoint]))
        }
        return minPaths(candidates)
      }
    }
  }
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

  { left: 8, top: 8, width: 10, height: 10 },
  { x: 17, y: 8 },
  // { x: 12, y: 15 },
  // { left: 130, top: 130, width: 50, height: 100 },
  // { x: 140, y: 230 },
  // { x: 180, y: 180 },
  Direction.TOP,
)
console.log(ret)
