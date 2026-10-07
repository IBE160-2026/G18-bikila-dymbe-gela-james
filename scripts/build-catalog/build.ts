// Pure catalog logic: no network, no file system. index.ts does the I/O.
import { z } from 'zod'
import { Catalog, CatalogEntry, NORWAY_BOUNDS } from '../../shared/contracts/catalog'

const SeedSchema = z.strictObject({
  navn: z.string().trim().min(1),
  type: z.enum(['fjelltopp', 'by']),
  kommune: z.string().trim().min(1),
  // Picks one specific Kartverket name object when the name is ambiguous within the municipality.
  stedsnummer: z.number().int().optional(),
})

export const SeedsSchema = z.strictObject({
  skisteder: z.strictObject({
    antall: z.number().int().positive(),
    ekskluder: z.array(z.string()),
    inkluder: z.array(z.string()),
  }),
  steder: z.array(SeedSchema),
})

export type Seed = z.infer<typeof SeedSchema>
export type SeedType = Seed['type']
export type Seeds = z.infer<typeof SeedsSchema>

export interface Candidate {
  navn: string
  lat: number
  lon: number
  type: CatalogEntry['type']
  kilde: CatalogEntry['kilde']
  kommune?: string
}

export interface Rejection {
  navn: string
  type: CatalogEntry['type']
  kilde: CatalogEntry['kilde']
  reason: string
}

// ---------------------------------------------------------------------------
// Shared helpers

export function round4(value: number): number {
  return Math.round(value * 1e4) / 1e4
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    // Sami letters that NFD does not decompose.
    .replace(/đ/g, 'd')
    .replace(/ŋ/g, 'n')
    .replace(/ŧ/g, 't')
    // Strip remaining diacritics (Sami names such as Kárášjohka) before replacing other characters.
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeName(text: string): string {
  return text.trim().toLocaleLowerCase('nb')
}

export function insideNorway(lat: number, lon: number): boolean {
  return (
    lat >= NORWAY_BOUNDS.minLat &&
    lat <= NORWAY_BOUNDS.maxLat &&
    lon >= NORWAY_BOUNDS.minLon &&
    lon <= NORWAY_BOUNDS.maxLon
  )
}

/** Great-circle distance in kilometres. */
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

const compareNb = (a: string, b: string) => a.localeCompare(b, 'nb')

// ---------------------------------------------------------------------------
// OpenStreetMap ski resorts

export interface OsmElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

// Two OSM areas with the same name closer than this are one resort mapped twice.
const SAME_RESORT_KM = 5
// Two OSM areas closer than this are one resort under different names (e.g. lift company and resort).
const SAME_AREA_KM = 1

function osmPosition(element: OsmElement): { lat: number; lon: number } | undefined {
  if (element.lat !== undefined && element.lon !== undefined) return { lat: element.lat, lon: element.lon }
  return element.center
}

function osmRank(element: OsmElement): [number, number] {
  const tags = element.tags ?? {}
  // Wikidata or a website is a proxy for how well known the resort is (spec: design notes).
  const known = tags.wikidata || tags.website ? 0 : 1
  const pistes = tags['piste:type'] ? 0 : 1
  return [known, pistes]
}

function compareOsm(a: OsmElement, b: OsmElement): number {
  const [ak, ap] = osmRank(a)
  const [bk, bp] = osmRank(b)
  return (
    ak - bk ||
    ap - bp ||
    compareNb(a.tags?.name ?? '', b.tags?.name ?? '') ||
    compareNb(a.type, b.type) ||
    a.id - b.id
  )
}

export interface SkiResortSelection {
  selected: Candidate[]
  rejected: Rejection[]
  /** Names in `inkluder` that OSM did not return. Fatal: the curated list is wrong. */
  missingIncludes: string[]
  /** Names in `ekskluder` that OSM did not return. Only a warning. */
  unusedExcludes: string[]
}

export function selectSkiResorts(elements: OsmElement[], config: Seeds['skisteder']): SkiResortSelection {
  const rejected: Rejection[] = []
  const nameOf = (element: OsmElement) => element.tags!.name!.trim()
  const excluded = new Set(config.ekskluder.map(normalizeName))
  const included = new Set(config.inkluder.map(normalizeName))
  const named = elements.filter((element) => element.tags?.name?.trim())
  const seenNames = new Set(named.map((element) => normalizeName(nameOf(element))))

  // Exclusion comes before deduplication, so an excluded stadium cannot absorb the resort next to it.
  const eligible: { element: OsmElement; position: { lat: number; lon: number } }[] = []
  for (const element of named.sort(compareOsm)) {
    const navn = nameOf(element)
    if (excluded.has(normalizeName(navn))) continue
    const position = osmPosition(element)
    if (!position) {
      rejected.push({ navn, type: 'skisted', kilde: 'osm', reason: 'mangler koordinater i OSM' })
      continue
    }
    // The Overpass area for Norway includes Svalbard; reject before ranking so it does not take a slot.
    if (!insideNorway(position.lat, position.lon)) {
      rejected.push({ navn, type: 'skisted', kilde: 'osm', reason: `koordinat utenfor Norge (${round4(position.lat)}, ${round4(position.lon)})` })
      continue
    }
    eligible.push({ element, position })
  }

  // Keep one element per resort; curated includes win, then the better ranked element.
  const isIncluded = ({ element }: (typeof eligible)[number]) => included.has(normalizeName(nameOf(element)))
  const unique: typeof eligible = []
  for (const entry of [...eligible.filter(isIncluded), ...eligible.filter((e) => !isIncluded(e))]) {
    const duplicate = unique.some((kept) => {
      const km = distanceKm(kept.position, entry.position)
      const sameName = normalizeName(nameOf(kept.element)) === normalizeName(nameOf(entry.element))
      return km < SAME_AREA_KM || (sameName && km < SAME_RESORT_KM)
    })
    if (!duplicate) unique.push(entry)
  }

  const toCandidate = ({ element, position }: (typeof unique)[number]): Candidate => ({
    navn: nameOf(element),
    lat: round4(position.lat),
    lon: round4(position.lon),
    type: 'skisted',
    kilde: 'osm',
  })
  const forced = unique.filter(isIncluded)
  const rest = unique.filter((e) => !isIncluded(e))
  const selected = [...forced, ...rest.slice(0, Math.max(0, config.antall - forced.length))].map(toCandidate)

  return {
    selected,
    rejected,
    missingIncludes: config.inkluder.filter((navn) => !seenNames.has(normalizeName(navn))),
    unusedExcludes: config.ekskluder.filter((navn) => !seenNames.has(normalizeName(navn))),
  }
}

// ---------------------------------------------------------------------------
// Kartverket place names

export interface StedsnavnHit {
  navneobjekttype: string
  stedsnummer: number
  stedstatus?: string
  representasjonspunkt: { nord: number; øst: number }
  kommuner?: { kommunenavn: string }[]
  stedsnavn?: { skrivemåte: string }[]
}

const KARTVERKET_TYPES: Record<SeedType, string[]> = {
  fjelltopp: ['Fjell', 'Topp'],
  by: ['By', 'Tettsted'],
}

// Sami municipalities are named "Kárášjohka - Karasjok"; any of the parts is a match.
function kommuneMatches(kommunenavn: string, wanted: string): boolean {
  const target = normalizeName(wanted)
  const parts = kommunenavn.split(/\s+[-–]\s+/).map(normalizeName)
  return normalizeName(kommunenavn) === target || parts.includes(target)
}

export type SeedResolution = { ok: true; candidate: Candidate } | { ok: false; reason: string }

export function resolveSeed(seed: Seed, hits: StedsnavnHit[]): SeedResolution {
  const typeOk = (hit: StedsnavnHit) => KARTVERKET_TYPES[seed.type].includes(hit.navneobjekttype)
  const nameOk = (hit: StedsnavnHit) =>
    (hit.stedsnavn ?? []).some((name) => normalizeName(name.skrivemåte) === normalizeName(seed.navn))
  const kommuneOk = (hit: StedsnavnHit) =>
    (hit.kommuner ?? []).some((kommune) => kommuneMatches(kommune.kommunenavn, seed.kommune))

  let matches = hits.filter((hit) => typeOk(hit) && nameOk(hit) && kommuneOk(hit))
  if (seed.stedsnummer !== undefined) {
    matches = matches.filter((hit) => hit.stedsnummer === seed.stedsnummer)
  }
  // Historic names ("relikt") live on next to the active one; prefer the active.
  const active = matches.filter((hit) => hit.stedstatus === undefined || hit.stedstatus === 'aktiv')
  if (active.length > 0) matches = active

  if (matches.length === 0) {
    const alternatives = hits
      .filter(typeOk)
      .map((hit) => `${hit.navneobjekttype} i ${(hit.kommuner ?? []).map((k) => k.kommunenavn).join('/')}`)
    const hint = alternatives.length > 0 ? ` (fant: ${alternatives.join(', ')})` : ''
    return { ok: false, reason: `ingen treff av type ${KARTVERKET_TYPES[seed.type].join('/')} i ${seed.kommune}${hint}` }
  }
  if (matches.length > 1) {
    const numbers = matches.map((hit) => hit.stedsnummer).join(', ')
    return { ok: false, reason: `flertydig i ${seed.kommune}, velg stedsnummer blant ${numbers}` }
  }

  const hit = matches[0]
  return {
    ok: true,
    candidate: {
      navn: seed.navn,
      lat: round4(hit.representasjonspunkt.nord),
      lon: round4(hit.representasjonspunkt.øst),
      type: seed.type,
      kilde: 'kartverket',
      kommune: seed.kommune,
    },
  }
}

// ---------------------------------------------------------------------------
// Deduplication, ids and validation

// Two candidates closer than this, with the same slug, are the same place from two sources.
const SAME_PLACE_KM = 2

export interface DedupResult {
  kept: Candidate[]
  duplicates: { kept: Candidate; dropped: Candidate }[]
}

/**
 * Removes the same place reported twice. The curated Kartverket list wins over OSM, then input order.
 */
export function dedupe(candidates: Candidate[]): DedupResult {
  const ordered = [
    ...candidates.filter((c) => c.kilde === 'kartverket'),
    ...candidates.filter((c) => c.kilde !== 'kartverket'),
  ]
  const kept: Candidate[] = []
  const duplicates: DedupResult['duplicates'] = []
  for (const candidate of ordered) {
    const same = kept.find(
      (other) =>
        (other.lat === candidate.lat && other.lon === candidate.lon) ||
        (slugify(other.navn) === slugify(candidate.navn) && distanceKm(other, candidate) < SAME_PLACE_KM),
    )
    if (same) duplicates.push({ kept: same, dropped: candidate })
    else kept.push(candidate)
  }
  return { kept, duplicates }
}

/** Candidates whose base slug is shared with another candidate and that still need a municipality. */
export function needsKommune(candidates: Candidate[]): Candidate[] {
  const counts = new Map<string, number>()
  for (const c of candidates) counts.set(slugify(c.navn), (counts.get(slugify(c.navn)) ?? 0) + 1)
  return candidates.filter((c) => (counts.get(slugify(c.navn)) ?? 0) > 1 && !c.kommune)
}

export function assignIds(candidates: Candidate[]): { candidate: Candidate; id: string }[] {
  const counts = new Map<string, number>()
  for (const c of candidates) counts.set(slugify(c.navn), (counts.get(slugify(c.navn)) ?? 0) + 1)
  return candidates.map((candidate) => {
    const base = slugify(candidate.navn)
    const collides = (counts.get(base) ?? 0) > 1
    const id = collides && candidate.kommune ? `${base}-${slugify(candidate.kommune)}` : base
    return { candidate, id }
  })
}

export interface FinalizeResult {
  catalog: Catalog
  rejected: Rejection[]
}

/**
 * Builds and validates the catalog. Invalid places are rejected one by one; anything the schema
 * still refuses afterwards (such as a remaining duplicate id) throws.
 */
export function finalize(
  candidates: Candidate[],
  heights: Map<Candidate, number | undefined>,
  generert: Date,
): FinalizeResult {
  const rejected: Rejection[] = []
  const steder: CatalogEntry[] = []

  for (const { candidate, id } of assignIds(candidates)) {
    const reject = (reason: string) => rejected.push({ navn: candidate.navn, type: candidate.type, kilde: candidate.kilde, reason })
    if (!insideNorway(candidate.lat, candidate.lon)) {
      reject(`koordinat utenfor Norge (${candidate.lat}, ${candidate.lon})`)
      continue
    }
    const height = heights.get(candidate)
    if (height === undefined || !Number.isFinite(height)) {
      reject('mangler høyde')
      continue
    }
    const entry = {
      id,
      navn: candidate.navn,
      lat: candidate.lat,
      lon: candidate.lon,
      hoyde: Math.round(height),
      type: candidate.type,
      kilde: candidate.kilde,
    }
    const parsed = CatalogEntry.safeParse(entry)
    if (!parsed.success) {
      reject(parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '))
      continue
    }
    steder.push(parsed.data)
  }

  steder.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  const catalog = Catalog.parse({ generert: generert.toISOString().replace(/\.\d{3}Z$/, 'Z'), steder })
  return { catalog, rejected }
}

export function summarize(catalog: Catalog): Record<CatalogEntry['type'], number> {
  const counts: Record<CatalogEntry['type'], number> = { skisted: 0, fjelltopp: 0, by: 0 }
  for (const sted of catalog.steder) counts[sted.type] += 1
  return counts
}
