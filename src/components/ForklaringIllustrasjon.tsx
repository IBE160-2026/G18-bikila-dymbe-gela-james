import { SNOWSCORE } from '../lib/snowscore'
import { medEnhet, tall } from '../lib/format'

// Story 2.1: one small graph per sub-score. Every point and label is computed from SNOWSCORE, so the
// graphs follow a parameter change by themselves (AD-6). The aria-label says what the graph shows.

type Merke = { verdi: number; tekst: string }
type Akse = { min: number; max: number; tittel: string; merker: Merke[] }
type Graf = { tittel: string; beskrivelse: string; x: Akse; y: Akse; punkter: [number, number][] }

export type Delpoeng = 'A' | 'B' | 'C'

const BREDDE = 320
const HOYDE = 210
const VENSTRE = 56
const HOYRE = 304
const TOPP = 16
const BUNN = 150

function grafFor(delpoeng: Delpoeng): Graf {
  const { maxA, maxB, maxC, fullSnowMm, noSnowAtOrAboveC, coldRangeC } = SNOWSCORE
  const poeng = (maks: number): Akse => ({
    min: 0,
    max: maks,
    tittel: 'Poeng',
    merker: [
      { verdi: 0, tekst: '0' },
      { verdi: maks, tekst: tall(maks) },
    ],
  })

  switch (delpoeng) {
    case 'A': {
      const xMax = fullSnowMm * 1.5
      return {
        tittel: 'A Nysnøpotensial',
        beskrivelse:
          `A øker jevnt fra 0 poeng ved 0 mm nysnø (S) til ${maxA} poeng ved ${medEnhet(fullSnowMm, 'mm')}, ` +
          `og er ${maxA} poeng ved mer nysnø enn det.`,
        x: {
          min: 0,
          max: xMax,
          tittel: 'Nysnø S (mm vann)',
          merker: [
            { verdi: 0, tekst: '0' },
            { verdi: fullSnowMm, tekst: tall(fullSnowMm) },
          ],
        },
        y: poeng(maxA),
        punkter: [
          [0, 0],
          [fullSnowMm, maxA],
          [xMax, maxA],
        ],
      }
    }
    case 'B': {
      const kaldest = noSnowAtOrAboveC - coldRangeC
      const xMin = kaldest - 4
      const xMax = noSnowAtOrAboveC + 4
      return {
        tittel: 'B Kuldebonus',
        beskrivelse:
          `B er 0 poeng når snittemperaturen (T̄) er ${medEnhet(noSnowAtOrAboveC, '°C')} eller varmere, ` +
          `øker jevnt jo kaldere det blir, og er ${maxB} poeng ved ${medEnhet(kaldest, '°C')} eller kaldere.`,
        x: {
          min: xMin,
          max: xMax,
          tittel: 'Snittemperatur T̄ (°C)',
          merker: [
            { verdi: kaldest, tekst: tall(kaldest) },
            { verdi: noSnowAtOrAboveC, tekst: tall(noSnowAtOrAboveC) },
          ],
        },
        y: poeng(maxB),
        punkter: [
          [xMin, maxB],
          [kaldest, maxB],
          [noSnowAtOrAboveC, 0],
          [xMax, 0],
        ],
      }
    }
    case 'C':
      return {
        tittel: 'C Snøandel',
        beskrivelse:
          `C øker jevnt fra 0 poeng når ingen av nedbøren kommer som snø (S/P = 0 %) ` +
          `til ${maxC} poeng når all nedbøren kommer som snø (S/P = 100 %).`,
        x: {
          min: 0,
          max: 1,
          tittel: 'Snøandel S/P (%)',
          merker: [
            { verdi: 0, tekst: '0' },
            { verdi: 1, tekst: '100' },
          ],
        },
        y: poeng(maxC),
        punkter: [
          [0, 0],
          [1, maxC],
        ],
      }
  }
}

/** A figure with the graph for one sub-score; the svg is one image with a text alternative. */
export default function ForklaringIllustrasjon({ delpoeng }: { delpoeng: Delpoeng }) {
  const { tittel, beskrivelse, x, y, punkter } = grafFor(delpoeng)
  const px = (verdi: number) => VENSTRE + ((verdi - x.min) / (x.max - x.min)) * (HOYRE - VENSTRE)
  const py = (verdi: number) => BUNN - ((verdi - y.min) / (y.max - y.min)) * (BUNN - TOPP)

  return (
    <figure className="forklaring-figur">
      <figcaption>{tittel}</figcaption>
      <svg
        viewBox={`0 0 ${BREDDE} ${HOYDE}`}
        role="img"
        aria-label={`Graf for ${tittel}: ${beskrivelse}`}
        className="forklaring-graf"
      >
        {y.merker.map(({ verdi, tekst }) => (
          <g key={`y${verdi}`}>
            <line className="graf-rutenett" x1={VENSTRE} x2={HOYRE} y1={py(verdi)} y2={py(verdi)} />
            <text className="graf-tekst" x={VENSTRE - 8} y={py(verdi) + 4} textAnchor="end">
              {tekst}
            </text>
          </g>
        ))}
        {x.merker.map(({ verdi, tekst }) => (
          <g key={`x${verdi}`}>
            <line className="graf-rutenett" x1={px(verdi)} x2={px(verdi)} y1={TOPP} y2={BUNN} />
            <text className="graf-tekst" x={px(verdi)} y={BUNN + 18} textAnchor="middle">
              {tekst}
            </text>
          </g>
        ))}
        <line className="graf-akse" x1={VENSTRE} x2={HOYRE} y1={BUNN} y2={BUNN} />
        <line className="graf-akse" x1={VENSTRE} x2={VENSTRE} y1={TOPP} y2={BUNN} />
        <polyline className="graf-linje" points={punkter.map(([a, b]) => `${px(a)},${py(b)}`).join(' ')} />
        {punkter.slice(1, -1).map(([a, b]) => (
          <circle key={`${a},${b}`} className="graf-punkt" cx={px(a)} cy={py(b)} r={4} />
        ))}
        <text className="graf-tekst" x={(VENSTRE + HOYRE) / 2} y={HOYDE - 8} textAnchor="middle">
          {x.tittel}
        </text>
        <text
          className="graf-tekst"
          x={16}
          y={(TOPP + BUNN) / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${(TOPP + BUNN) / 2})`}
        >
          {y.tittel}
        </text>
      </svg>
    </figure>
  )
}
