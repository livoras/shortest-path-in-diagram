interface IPoint {
  x: number,
  y: number,
}

const findIntersection = (p1: IPoint, p2: IPoint, p3: IPoint, p4: IPoint): IPoint => {
  const x =
    ((p1.x * p2.y - p2.x * p1.y) * (p3.x - p4.x) -
      (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x)) /
    ((p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x))
  const y =
    ((p1.x * p2.y - p2.x * p1.y) * (p3.y - p4.y) -
      (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x)) /
    ((p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x))
  return { x, y }
}

const isPointBetween = (p: IPoint, a: IPoint, b: IPoint): boolean => {
  return ((a.x <= p.x && p.x <= b.x) || (a.x >= p.x && p.x >= b.x)) &&
    ((a.y <= p.y && p.y <= b.y) || (a.y >= p.y && p.y >= b.y))
}

export const findSegmentIntersection = (p1: IPoint, p2: IPoint, p3: IPoint, p4: IPoint): IPoint | null => {
  const i1 = findIntersection(p1, p2, p3, p4)
  const isIntersected = isPointBetween(i1, p1, p2) && isPointBetween(i1, p3, p4)
  return isIntersected ? i1 : null
}
