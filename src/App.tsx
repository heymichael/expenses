import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  AppRail,
  useRailExpanded,
  PaneToolbar,
  PaneLayout,
  ChatPanel,
  useAuthUser,
} from '@haderach/shared-ui';
import type { PaneId, PaneLayoutHandle } from '@haderach/shared-ui';

import { Loader2 } from 'lucide-react';
import { SpendToolbar } from './SpendToolbar';
import type { SpendViewMode } from './SpendToolbar';
import { SpendDataView } from './SpendDataView';
import { useVendors } from './useVendors';
import { fetchVendorSpend } from './fetchVendorSpend';
import { groupSpendRows } from './groupSpendRows';
import type { SpendRow } from './types';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function sixMonthsAgoISO(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export function App() {
  const { vendors, loading: vendorsLoading, error: vendorsError } = useVendors();
  const authUser = useAuthUser();

  const getIdTokenRef = useRef(authUser.getIdToken);
  getIdTokenRef.current = authUser.getIdToken;

  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState(sixMonthsAgoISO);
  const [dateTo, setDateTo] = useState(todayISO);
  const [rows, setRows] = useState<SpendRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noData, setNoData] = useState<string | null>(null);
  const [spendViewMode, setSpendViewMode] = useState<SpendViewMode>('chart');
  const [railExpanded, toggleRail] = useRailExpanded();
  const [chatOpen, setChatOpen] = useState(true);
  const [detailPane, setDetailPane] = useState<'analytics' | 'data' | null>(null);

  const paneRef = useRef<PaneLayoutHandle>(null);

  const handlePaneToggle = useCallback((id: PaneId) => {
    paneRef.current?.togglePane(id);
  }, []);

  const handleLayoutChange = useCallback((chat: boolean, detail: 'analytics' | 'data' | null) => {
    setChatOpen(chat);
    setDetailPane(detail);
  }, []);

  const initialized = useRef(false);
  const prevVendorIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (vendorsLoading || vendors.length === 0) return;

    const currentIds = new Set(vendors.map((v) => v.id));

    if (!initialized.current) {
      initialized.current = true;
      setSelectedVendors([...currentIds]);
      const depts = [...new Set(vendors.map((v) => v.department).filter(Boolean))] as string[];
      setSelectedDepartments(depts);
      prevVendorIds.current = currentIds;
      return;
    }

    const newIds = [...currentIds].filter((id) => !prevVendorIds.current.has(id));
    if (newIds.length > 0) {
      setSelectedVendors((prev) => [...prev, ...newIds]);
    }
    prevVendorIds.current = currentIds;
  }, [vendorsLoading, vendors]);

  const effectiveVendorIds = useMemo(() => {
    if (selectedDepartments.length === 0) return selectedVendors;
    const deptSet = new Set(selectedDepartments);
    const deptVendorIds = new Set(
      vendors.filter((v) => v.department && deptSet.has(v.department)).map((v) => v.id),
    );
    return selectedVendors.filter((id) => deptVendorIds.has(id));
  }, [selectedVendors, selectedDepartments, vendors]);

  useEffect(() => {
    if (effectiveVendorIds.length === 0 || !dateFrom || !dateTo) {
      setRows([]);
      setNoData(effectiveVendorIds.length === 0 ? 'Select vendors or departments to view spend data.' : null);
      return;
    }
    if (dateFrom > dateTo) return;

    const timer = setTimeout(async () => {
      setError(null);
      setNoData(null);
      setLoading(true);

      try {
        const raw = await fetchVendorSpend(effectiveVendorIds, dateFrom, dateTo, getIdTokenRef.current);
        if (raw.length === 0) {
          setNoData('No spend data found for the selected vendors in that date range.');
        }
        setRows(groupSpendRows(raw));
      } catch (err) {
        setError(`Error fetching spend: ${err instanceof Error ? err.message : err}`);
      } finally {
        setLoading(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [effectiveVendorIds, dateFrom, dateTo]);

  const handleDownloadCsv = useCallback(() => {
    if (rows.length === 0) return;
    const header = 'vendor,month,amount';
    const csvRows = rows.map((r) => `${r.vendor},${r.month},${r.amount}`);
    const csv = [header, ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendor-spend.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [rows]);

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
        openPanes={{ chat: chatOpen, analytics: detailPane === 'analytics', data: false }}
        getIdToken={authUser.getIdToken}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <PaneToolbar
          activePanes={{
            chat: chatOpen,
            analytics: detailPane === 'analytics',
            data: false,
          }}
          panes={['chat', 'analytics']}
          onPaneToggle={handlePaneToggle}
        />

        <PaneLayout
          ref={paneRef}
          chatOpen={chatOpen}
          detailPane={detailPane}
          onLayoutChange={handleLayoutChange}
          chatContent={
            <ChatPanel
              mode="panel"
              appContext="expenses"
              getIdToken={authUser.getIdToken}
              inputPlaceholder="What expense questions can I help answer?"
            />
          }
          dataContent={<></>}
          analyticsContent={
            <div className="flex flex-1 min-h-0 flex-col p-2">
              <div className="flex flex-1 min-h-0 flex-col rounded-xl border border-border bg-card shadow-sm">
                {vendorsError && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 rounded m-4">
                    Error loading vendors: {vendorsError}
                  </div>
                )}
                <SpendToolbar
                  vendors={vendors}
                  selectedVendors={selectedVendors}
                  onVendorsChange={setSelectedVendors}
                  selectedDepartments={selectedDepartments}
                  onDepartmentsChange={setSelectedDepartments}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onDateFromChange={setDateFrom}
                  onDateToChange={setDateTo}
                  viewMode={spendViewMode}
                  onViewModeChange={setSpendViewMode}
                  onDownload={handleDownloadCsv}
                />
                {error && (
                  <div className="px-4 pt-2 text-sm text-red-600">{error}</div>
                )}
                <div className="flex flex-1 min-h-0 flex-col px-4">
                  {loading && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {noData && <p className="no-data">{noData}</p>}
                  {!loading && <SpendDataView rows={rows} viewMode={spendViewMode} />}
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
