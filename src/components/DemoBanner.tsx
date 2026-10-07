// UX-DR16 (banner-demo in DESIGN.md): neutral, cannot be closed, blocks nothing, links to the README.
export const README_URL = 'https://github.com/IBE160-2026/G18-bikila-dymbe-gela-james#demomodus'

export default function DemoBanner() {
  return (
    <div className="banner-demo" role="note">
      Demodata – ikke ekte prognoser. <a href={README_URL}>Les mer om demomodus</a>
    </div>
  )
}
