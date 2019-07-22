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

  /** 需要经过水平的中线的情况 */
  if (
    isTopDown &&
    (fromPoint.x < toPoint.x && isBottomLeft(fromDirection) && isTopRight(toDirection)) ||
    (fromPoint.x > toPoint.x && isBottomLeft(toDirection) && isTopRight(fromDirection))
  ) {
    if (hasHorizentalGap) {
      // TODO
    } else {
      // TODO
      if (hasVerticalGap)  {
        // TODO
      } else {
        // TODO
      }
    }
  }

  if (
    !isTopDown &&
    (fromPoint.x < toPoint.x && isTopLeft(fromDirection) && isBottomRight(toDirection)) ||
    (fromPoint.x > toPoint.x && isTopLeft(toDirection) && isBottomRight(fromDirection))
  ) {
    if (hasHorizentalGap) {
      // TODO
    } else {
      // TODO
      if (hasVerticalGap)  {
        // TODO
      } else {
        // TODO
      }
    }
  }

  /** 需要经过垂直的中线的情况 */
  if (
    isTopDown &&
    (fromPoint.x < toPoint.x && isTopRight(fromDirection) && isBottomLeft(toDirection)) ||
    (fromPoint.x > toPoint.x && isTopRight(toDirection) && isBottomLeft(fromDirection))
  ) {
    if (hasVerticalGap) {
      // TODO
    } else {
      // TODO
      if (hasHorizentalGap)  {
        // TODO
      } else {
        // TODO
      }
    }
  }

  if (
    !isTopDown &&
    (fromPoint.x < toPoint.x && isTopLeft(fromDirection) && isBottomRight(toDirection)) ||
    (fromPoint.x > toPoint.x && isTopLeft(fromDirection) && isBottomRight(toDirection))
  ) {
    if (hasVerticalGap) {
      // TODO
    } else {
      // TODO
      if (hasHorizentalGap)  {
        // TODO
      } else {
        // TODO
      }
    }
  }
}

const getRectPoints = (rect: IRectangle): IPoint[] => {
  const { left: x1, top: y1, width: w1, height: h1 } = rect
  const a = { x: x1, y: y1 }
  const b = { x: x1 + w1, y: y1 }
  const c = { x: x1 + w1, y: y1 + h1 }
  const d = { x: x1, y: y1 + h1 }
  return [a, b, c, d]
}

// export const getShortestPath = (
//   fromRect: IRectangle,
//   fromPoint: IPoint,
//   fromDirection: Direction,

//   toRect: IRectangle,
//   toPoint: IPoint,
//   toDirection: Direction,
// ): Path => {
//   if (isSameDirection(fromDirection, toDirection)) {
//     return getShortestPathOfSameDirection(
//       fromPoint,
//       toPoint,
//       fromDirection,
//     )
//   }

//   if (isReverseDirection(fromDirection, toDirection))  {
//     return getShortestPathOfReverseDirection(
//       fromRect, fromPoint, fromDirection,
//       toRect, toPoint, toDirection,
//     )
//   }

//   const [
//     sFromRect, sFromPoint, sFromDirection,
//     sToRect, sToPoint, sToDirection,
//   ] = convertToSameDirection(
//     fromRect, fromPoint, fromDirection,
//     toRect, toPoint, toDirection,
//   )

//   const sPath = getShortestPathOfSameDirection(
//     sFromRect, sFromPoint, sFromDirection,
//     sToRect, sToPoint, sToDirection,
//   )

//   const [
//     rFromRect, rFromPoint, rFromDirection,
//     rToRect, rToPoint, rToDirection,
//   ] = convertToReverseDirection(
//     fromRect, fromPoint, fromDirection,
//     toRect, toPoint, toDirection,
//   )

//   const rPath = getShortestPathOfReverseDirection(
//     rFromRect, rFromPoint, rFromDirection,
//     rToRect, rToPoint, rToDirection,
//   )

//   return minPath([sPath, rPath])
// }

// const isSameDirection = (d1: Direction, d2: Direction): boolean => {
//   return d1 === d2
// }

// const isReverseDirection = (d1: Direction, d2: Direction): boolean => {
//   return (d1 === Direction.LEFT && d2 === Direction.RIGHT) ||
//     (d1 === Direction.RIGHT && d2 === Direction.LEFT) ||
//     (d1 === Direction.TOP && d2 === Direction.BOTTOM) ||
//     (d1 === Direction.BOTTOM && d2 === Direction.TOP)
// }

// const getShortestPathOfSameDirection = (
//   fromPoint: IPoint,
//   toPoint: IPoint,
//   direction: Direction,
// ): Path => {
//   const px = fromPoint.x
//   const py = fromPoint.y
//   const nx = toPoint.x
//   const ny = toPoint.y
//   const nxpy = { x: nx, y: py }
//   const pxny = { x: px, y: ny }

//   const inflection: IPoint = (direction === Direction.TOP ||  direction === Direction.RIGHT)
//     ? nxpy
//     : pxny

//   return [fromPoint, inflection, toPoint]
// }

// const getShortestPathOfReverseDirection = (
//   fromPoint: IPoint,
//   toPoint: IPoint,
//   fromDirection: Direction,
//   hasHorizontalCenterPath: boolean,
//   hasVerticalCenterPath: boolean,
//   center: IPoint,
// ): Path => {

// }
