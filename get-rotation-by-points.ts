export interface IPoint {
  x: number,
  y: number,
}

export const getRotationByPoints = (startPoint: IPoint, movingPoint: IPoint, center: IPoint): number => {
  const movedA = minisPoint(startPoint, center)
  const movedB = minisPoint(movingPoint, center)
  const angleA = Math.atan2(movedA.y, movedA.x)
  const angleB = Math.atan2(movedB.y, movedB.x)
  return (angleB - angleA) / Math.PI * 180
}

const minisPoint = (p1: IPoint, p2: IPoint): IPoint => ({ x: p1.x - p2.x, y: p1.y - p2.y })

/////////////// TEST ///////////
console.log(getRotationByPoints({ x: 100, y: 100 }, { x: 200, y: 100 }, { x: 150, y: 150 }))
const sqrt3 = Math.sqrt(3)
console.log(getRotationByPoints({ x: 100 + 50 * sqrt3, y: 50 }, { x: 100 + 50 * sqrt3, y: 150 }, { x: 100, y: 100 }))
console.log(getRotationByPoints({ x: 100 + 50 * sqrt3, y: 150 }, { x: 100 + 50 * sqrt3, y: 50 }, { x: 100, y: 100 }))
