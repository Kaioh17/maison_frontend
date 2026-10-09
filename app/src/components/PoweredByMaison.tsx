import MaisonWordmark from './MaisonWordmark'

/** Small "Powered by Maison" footer credit for the white-labeled rider and driver apps. */
export default function PoweredByMaison({ className }: { className?: string }) {
  return (
    <p
      className={className}
      style={{ margin: '24px 0 0', textAlign: 'center', fontSize: 12, color: 'var(--bw-muted)', opacity: 0.8 }}
    >
      Powered by <MaisonWordmark color="var(--bw-muted)" style={{ fontSize: 'inherit' }} />
    </p>
  )
}
