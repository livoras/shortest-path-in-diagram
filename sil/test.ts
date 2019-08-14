import { getShortestPathInDiagram } from "./index4"
import { Direction } from "../interfaces"
import { expect } from "chai"

// tslint:disable-next-line: no-big-function
describe("check shortest path", () => {
  it("no gap twice moving right -> left", () => {
    const ret = getShortestPathInDiagram(
      { left: 0, top: 0, width: 10, height: 10 },
      { x: 10, y: 2 },
      Direction.RIGHT,

      { left: 8, top: 8, width: 10, height: 10 },
      { x: 8, y: 10 },
      Direction.LEFT,
    )
    expect(ret).to.be.deep.equal([ { x: 10, y: 2 },
      { x: 10, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: 8, y: 10 } ])
  })

  it("no gap twice moving left -> right", () => {
    const ret = getShortestPathInDiagram(
      { left: 8, top: 0, width: 10, height: 10 },
      { x: 8, y: 2 },
      Direction.LEFT,

      { left: 0, top: 8, width: 10, height: 10 },
      { x: 10, y: 16 },
      Direction.RIGHT,
    )
    expect(ret).to.be.deep.equal(
      [ { x: 8, y: 2 },
        { x: 8, y: 0 },
        { x: 18, y: 0 },
        { x: 18, y: 16 },
        { x: 10, y: 16 },
      ],
    )
  })

  it("no gap twice moving bottom -> top", () => {
    const ret = getShortestPathInDiagram(
      { left: 0, top: 0, width: 10, height: 10 },
      { x: 2, y: 10 },
      Direction.BOTTOM,

      { left: 8, top: 8, width: 10, height: 10 },
      { x: 11, y: 8 },
      Direction.TOP,
    )
    expect(ret).to.be.deep.equal(
      [ { x: 2, y: 10 },
        { x: 0, y: 10 },
        { x: 0, y: 0 },
        { x: 11, y: 0 },
        { x: 11, y: 8 } ],
    )
  })

  it("no gap twice moving top -> bottom", () => {
    const ret = getShortestPathInDiagram(
      { left: 0, top: 8, width: 10, height: 10 },
      { x: 2, y: 8 },
      Direction.TOP,

      { left: 8, top: 0, width: 10, height: 10 },
      { x: 11, y: 10 },
      Direction.BOTTOM,
    )
    expect(ret).to.be.deep.equal(
      [ { x: 2, y: 8 },
        { x: 0, y: 8 },
        { x: 0, y: 18 },
        { x: 11, y: 18 },
        { x: 11, y: 10 } ],
    )
  })

  it("gap sil left top down up, top -> left", () => {
    const ret = getShortestPathInDiagram(
      { left: 0, top: 12, width: 10, height: 10 },
      { x: 2, y: 12 },
      Direction.TOP,

      { left: 12, top: 0, width: 10, height: 10 },
      { x: 12, y: 2 },
      Direction.LEFT,
    )
    expect(ret).to.be.deep.equal(
      [
        { x: 2, y: 12 },
        { x: 2, y: 2 },
        { x: 12, y: 2 },
      ],
    )
  })

  it("gap sil left top down up, top -> rigth", () => {
    const ret = getShortestPathInDiagram(
      { left: 0, top: 12, width: 10, height: 10 },
      { x: 2, y: 12 },
      Direction.TOP,

      { left: 12, top: 0, width: 10, height: 10 },
      { x: 22, y: 2 },
      Direction.RIGHT,
    )
    expect(ret).to.be.deep.equal(
      [
        { x: 2, y: 12 },
        { x: 22, y: 12 },
        { x: 22, y: 2 },
      ],
    )
  })

  it("gap sil left top down up, top -> bottom", () => {
    const ret = getShortestPathInDiagram(
      { left: 0, top: 12, width: 10, height: 10 },
      { x: 2, y: 12 },
      Direction.TOP,

      { left: 12, top: 0, width: 10, height: 10 },
      { x: 13, y: 10 },
      Direction.BOTTOM,
    )
    expect(ret).to.be.deep.equal(
      [
        { x: 2, y: 12 },
        { x: 2, y: 11 },
        { x: 11, y: 11 },
        { x: 13, y: 11 },
        { x: 13, y: 10 },
      ],
    )
  })

  it("rect vertically inside the other rect", () => {
    const ret = getShortestPathInDiagram(
      { left: 0, top: 0, width: 10, height: 10 },
      { x: 10, y: 5 },
      Direction.RIGHT,

      { left: 16, top: 2, width: 10, height: 8 },
      { x: 16, y: 5 },
      Direction.LEFT,
    )
    expect(ret).to.be.deep.equal([
      { x: 10, y: 5 },
      { x: 13, y: 5 },
      { x: 16, y: 5 },
    ])
  })

  it("rect horizontally inside the other rect", () => {
    const ret = getShortestPathInDiagram(
      { left: 0, top: 0, width: 10, height: 10 },
      { x: 5, y: 10 },
      Direction.BOTTOM,

      { left: 2, top: 16, width: 10, height: 8 },
      { x: 5, y: 16 },
      Direction.TOP,
    )
    expect(ret).to.be.deep.equal([
      { x: 5, y: 10 },
      { x: 5, y: 13 },
      { x: 5, y: 16 },
    ])
  })
})
