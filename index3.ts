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

export const getShortestPath = (
  fromRect: IRectangle,
  fromPoint: IPoint,
  fromDirection: Direction,

  toRect: IRectangle,
  toPoint: IPoint,
  toDirection: Direction,
): Path => {
  if (isSameDirection(fromDirection, toDirection)) {
    return getShortestPathOfSameDirection(
      fromPoint,
      toPoint,
      fromDirection,
    )
  }

  if (isReverseDirection(fromDirection, toDirection))  {
    return getShortestPathOfReverseDirection(
      fromRect, fromPoint, fromDirection,
      toRect, toPoint, toDirection,
    )
  }

  const [
    sFromRect, sFromPoint, sFromDirection,
    sToRect, sToPoint, sToDirection,
  ] = convertToSameDirection(
    fromRect, fromPoint, fromDirection,
    toRect, toPoint, toDirection,
  )

  const sPath = getShortestPathOfSameDirection(
    sFromRect, sFromPoint, sFromDirection,
    sToRect, sToPoint, sToDirection,
  )

  const [
    rFromRect, rFromPoint, rFromDirection,
    rToRect, rToPoint, rToDirection,
  ] = convertToReverseDirection(
    fromRect, fromPoint, fromDirection,
    toRect, toPoint, toDirection,
  )

  const rPath = getShortestPathOfReverseDirection(
    rFromRect, rFromPoint, rFromDirection,
    rToRect, rToPoint, rToDirection,
  )

  return minPath([sPath, rPath])
}

const isSameDirection = (d1: Direction, d2: Direction): boolean => {
  return d1 === d2
}

const isReverseDirection = (d1: Direction, d2: Direction): boolean => {
  return (d1 === Direction.LEFT && d2 === Direction.RIGHT) ||
    (d1 === Direction.RIGHT && d2 === Direction.LEFT) ||
    (d1 === Direction.TOP && d2 === Direction.BOTTOM) ||
    (d1 === Direction.BOTTOM && d2 === Direction.TOP)
}

const getShortestPathOfSameDirection = (
  fromPoint: IPoint,
  toPoint: IPoint,
  direction: Direction,
): Path => {
  const px = fromPoint.x
  const py = fromPoint.y
  const nx = toPoint.x
  const ny = toPoint.y
  const nxpy = { x: nx, y: py }
  const pxny = { x: px, y: ny }

  const inflection: IPoint = (direction === Direction.TOP ||  direction === Direction.RIGHT)
    ? nxpy
    : pxny

  return [fromPoint, inflection, toPoint]
}

const getShortestPathOfReverseDirection = (
  fromPoint: IPoint,
  toPoint: IPoint,
  fromDirection: Direction,
  hasHorizontalCenterPath: boolean,
  hasVerticalCenterPath: boolean,
  center: IPoint,
): Path => {

}
