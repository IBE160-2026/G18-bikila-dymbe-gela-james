import { describe, expect, it } from 'vitest'
import * as shared from '../../shared/snowscore'
import * as lib from './snowscore'

describe('src/lib/snowscore', () => {
  it('re-exports the shared module unchanged', () => {
    expect(lib.computeSnowScore).toBe(shared.computeSnowScore)
    expect(lib.snowFraction).toBe(shared.snowFraction)
    expect(lib.mmToCm).toBe(shared.mmToCm)
    expect(lib.SNOWSCORE).toBe(shared.SNOWSCORE)
    expect(lib.selectWindow).toBe(shared.selectWindow)
    expect(lib.WINDOW_HOURS).toBe(shared.WINDOW_HOURS)
  })
})
