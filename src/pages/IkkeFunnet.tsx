import Lenke from '../components/Lenke'

export default function IkkeFunnet({ melding }: { melding: string }) {
  return (
    <>
      <h1 className="sted-navn">{melding}</h1>
      <Lenke to={{ name: 'utforsk', visning: 'kart' }}>Gå til kartet</Lenke>
    </>
  )
}
