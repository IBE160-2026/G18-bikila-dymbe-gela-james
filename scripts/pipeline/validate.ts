// AD-2 stage: validates every raw response against its Zod contract. Invalid responses are rejected
// and recorded with place, source and reason; they are never repaired (AD-11).
import type { z } from 'zod'
import { MetForecast } from '../../shared/contracts/met'
import { NveGridTimeSeries } from '../../shared/contracts/nve'
import type { Avvisning } from '../../shared/contracts/published'
import type { RunContext, ValidatedResponses } from '../../shared/contracts/run'

export const MISSING_RESPONSE = 'Mangler svar'
const MAX_ISSUES_IN_REASON = 3

function describeIssues(error: z.ZodError): string {
  const issues = error.issues.slice(0, MAX_ISSUES_IN_REASON).map((issue) => {
    const path = issue.path.join('.')
    return path ? `${path}: ${issue.message}` : issue.message
  })
  const more = error.issues.length - MAX_ISSUES_IN_REASON
  return more > 0 ? `${issues.join('; ')} (+${more} til)` : issues.join('; ')
}

function check<T>(
  schema: z.ZodType<T>,
  value: unknown,
  stedId: string,
  kilde: Avvisning['kilde'],
  avviste: Avvisning[],
): T | null {
  if (value === undefined) {
    avviste.push({ stedId, kilde, arsak: MISSING_RESPONSE })
    return null
  }
  const result = schema.safeParse(value)
  if (result.success) return result.data
  avviste.push({ stedId, kilde, arsak: describeIssues(result.error) })
  return null
}

export function validate(ctx: RunContext): RunContext {
  const avviste: Avvisning[] = []
  const rawById = new Map(ctx.raw.map((r) => [r.stedId, r]))
  const validated: ValidatedResponses[] = ctx.catalog.map((sted) => {
    const raw = rawById.get(sted.id)
    return {
      stedId: sted.id,
      met: check(MetForecast, raw?.met, sted.id, 'met', avviste),
      nve: check(NveGridTimeSeries, raw?.nve, sted.id, 'nve', avviste),
    }
  })
  return { ...ctx, validated, avviste }
}
