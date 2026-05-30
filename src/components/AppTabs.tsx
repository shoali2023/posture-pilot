export type AppTab = 'home' | 'live' | 'reminders' | 'analytics' | 'settings'

interface TabDef {
  id: AppTab
  label: string
}

const TABS: TabDef[] = [
  { id: 'home',      label: 'Home' },
  { id: 'live',      label: 'Live Check' },
  { id: 'reminders', label: 'Reminders' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings',  label: 'Settings' },
]

interface Props {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
}

export function AppTabs({ activeTab, onTabChange }: Props) {
  return (
    <nav className="app-tabs" role="tablist" aria-label="Main navigation">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`app-tab-btn${activeTab === tab.id ? ' app-tab-btn--active' : ''}`}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
