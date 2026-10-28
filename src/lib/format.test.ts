import { describe, expect, it } from 'vitest'
import { delpoeng, medEnhet, norskTid, tidsrom, utdatertTekst } from './format'

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

describe('tidsrom', () => {
  it('shows the ski window as weekday and whole hours in Norwegian time, summer and winter', () => {
    // 9 October 2026 is a Friday (CEST, UTC+2); 9 January 2027 a Saturday (CET, UTC+1).
    expect(tidsrom('2026-10-09T11:00:00Z', 4)).toBe('fredag 13–17')
    expect(tidsrom('2027-01-09T09:00:00Z', 4)).toBe('lørdag 10–14')
    expect(tidsrom('2026-10-09T05:00:00Z', 2)).toBe('fredag 07–09')
  })

  it('ends a window at midnight at 24, and names both days when it crosses midnight', () => {
    expect(tidsrom('2027-01-09T19:00:00Z', 4)).toBe('lørdag 20–24')
    expect(tidsrom('2027-01-09T21:00:00Z', 4)).toBe('lørdag 22–søndag 02')
  })

  it('shows a dash for an invalid time', () => {
    expect(tidsrom('ikke en tid', 4)).toBe('–')
  })
})
