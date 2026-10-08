import { describe, expect, it } from 'vitest'
import { delpoeng, medEnhet, norskTid, utdatertTekst } from './format'

describe('medEnhet', () => {
  it('formats in Norwegian with one decimal, and shows a dash for missing data', () => {
    expect(medEnhet(3.000000000000001, 'cm')).toBe('3 cm')
    expect(medEnhet(0.285, 'cm')).toBe('0,3 cm')
    expect(medEnhet(-8.89, '°C')).toBe('−8,9 °C')
    // -0.04 °C rounds to 0, not "−0".
    expect(medEnhet(-0.04, '°C')).toBe('0 °C')
    expect(medEnhet(null, 'm/s')).toBe('–')
  })
})

describe('delpoeng', () => {
  it('always shows one decimal and the maximum', () => {
    expect(delpoeng(19.2, 60)).toBe('19,2 av 60')
    expect(delpoeng(13.072916666666668, 25)).toBe('13,1 av 25')
    expect(delpoeng(15, 15)).toBe('15,0 av 15')
    expect(delpoeng(0, 60)).toBe('0,0 av 60')
  })
})

describe('norskTid', () => {
  it('shows UTC timestamps in Norwegian local time, summer and winter', () => {
    // CEST (UTC+2) in October before the switch, CET (UTC+1) in January.
    expect(norskTid('2026-10-07T16:30:29Z')).toBe('7. oktober 2026 kl. 18:30')
    expect(norskTid('2027-01-15T12:00:00Z')).toBe('15. januar 2027 kl. 13:00')
  })

  it('shows a dash when the time is missing', () => {
    expect(norskTid(null)).toBe('–')
  })
})

describe('utdatertTekst', () => {
  it('names the mark and the source time in Norwegian time', () => {
    expect(utdatertTekst('2026-10-07T16:30:29Z')).toBe('Utdatert · data fra 7. oktober 2026 kl. 18:30')
  })
})
