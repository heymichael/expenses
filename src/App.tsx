import {
  AppRail,
  useRailExpanded,
  PaneToolbar,
  ChatPanel,
  useAuthUser,
} from '@haderach/shared-ui'

export function App() {
  const authUser = useAuthUser()
  const [railExpanded, toggleRail] = useRailExpanded()

  return (
    <div className="app-shell">
      <AppRail
        apps={authUser.accessibleApps}
        activeAppId="expenses"
        expanded={railExpanded}
        onToggle={toggleRail}
        userEmail={authUser.email}
        userPhotoURL={authUser.photoURL}
        userDisplayName={authUser.displayName}
        onSignOut={authUser.signOut}
        getIdToken={authUser.getIdToken}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <PaneToolbar
          activePanes={{ chat: true, analytics: false, data: false }}
          panes={['chat']}
          onPaneToggle={() => {}}
        />
        <ChatPanel
          mode="panel"
          appContext="expenses"
          getIdToken={authUser.getIdToken}
          inputPlaceholder="What expense questions can I help answer?"
        />
      </div>
    </div>
  )
}
