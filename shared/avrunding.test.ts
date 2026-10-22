import { describe, expect, it } from 'vitest'
import { rundTilEnDesimal } from './avrunding'

describe('rundTilEnDesimal', () => {
  it('rounds like the app shows numbers, without −0', () => {
    expect(rundTilEnDesimal(3.000000000000001)).toBe(3)
    expect(rundTilEnDesimal(2.96)).toBe(3)
    expect(rundTilEnDesimal(2.94)).toBe(2.9)
    expect(rundTilEnDesimal(-5.04)).toBe(-5)
    expect(rundTilEnDesimal(-4.96)).toBe(-5)
    expect(Object.is(rundTilEnDesimal(-0.04), 0)).toBe(true)
  })
})
