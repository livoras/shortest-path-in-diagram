import { findSegmentIntersection } from "../line-intersection"
import { expect } from "chai"

describe("Test line intersection", () => {
  it("lines should not be intersected", () => {
    const inter = findSegmentIntersection({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 20, y: 20 }, { x: 120, y: 20 })
    expect(inter).to.be.equal(null)
  })

  it("lines should be intersected", () => {
    const inter = findSegmentIntersection({ x: 50, y: 0 }, { x: 50, y: 100 }, { x: 0, y: 20 }, { x: 120, y: 20 })
    expect(inter).to.be.deep.equal({ x: 50, y: 20 })
  })
})
