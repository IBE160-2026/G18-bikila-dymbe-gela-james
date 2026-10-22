/**
 * One formula on its own line on the explanation page, shared by the page and the worked example.
 * `children` is plain text, so a formula reads the same wherever it appears.
 */
export default function Formel({ children }: { children: string }) {
  return <p className="formel">{children}</p>
}
