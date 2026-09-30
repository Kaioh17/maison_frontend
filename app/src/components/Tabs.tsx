export interface TabItem<T extends string> {
  id: T
  label: string
  count?: number
}

export interface TabsProps<T extends string> {
  tabs: ReadonlyArray<TabItem<T>>
  value: T
  onChange: (id: T) => void
  ariaLabel: string
}

/** Underlined filter tabs with optional counts (`.dtabs`). */
export default function Tabs<T extends string>({ tabs, value, onChange, ariaLabel }: TabsProps<T>) {
  return (
    <div className="dtabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          className="dtab"
          aria-selected={t.id === value}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {t.count !== undefined && <span className="dtab-count">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}
