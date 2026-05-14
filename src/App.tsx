import { useState } from 'react'
import type { UserRole } from './types'
import { useAuth } from './lib/AuthContext'
import AuthPage              from './pages/auth/AuthPage'
import Sidebar               from './components/Sidebar'
import Header                from './components/Header'
import OODashboard           from './pages/owner-op/OODashboard'
import DispatcherDashboard   from './pages/dispatcher/DispatcherDashboard'
import NewDispatcherDashboard from './pages/dispatcher/NewDispatcherDashboard'
import DispatcherMarketplace from './pages/dispatcher/DispatcherMarketplace'
import CompanyDashboard      from './pages/company/CompanyDashboard'
import ShipperDashboard      from './pages/shipper/ShipperDashboard'
import LoadBoardPage         from './pages/loads/LoadBoardPage'
import FinancePage           from './pages/finance/FinancePage'
import TrackingPage          from './pages/tracking/TrackingPage'
import ChatPage              from './pages/chat/ChatPage'
import PostLoadPage          from './pages/shipper/PostLoadPage'
import ShipmentsPage         from './pages/shipper/ShipmentsPage'
import ClientsPage           from './pages/dispatcher/ClientsPage'
import FleetPage             from './pages/company/FleetPage'
import DriversPage           from './pages/company/DriversPage'
import AnalyticsPage         from './pages/company/AnalyticsPage'
import DocumentsPage         from './pages/docs/DocumentsPage'
import SettingsPage          from './pages/settings/SettingsPage'
import RoutePlannerPage      from './pages/route/RoutePlannerPage'
import CompliancePage        from './pages/compliance/CompliancePage'
import MaintenancePage       from './pages/maintenance/MaintenancePage'
import InvoicesPage          from './pages/invoices/InvoicesPage'
import PayrollPage           from './pages/payroll/PayrollPage'
import DispatchBoardPage     from './pages/dispatch/DispatchBoardPage'
import FuelLogPage           from './pages/fuel/FuelLogPage'
import ReportsPage           from './pages/reports/ReportsPage'
import SafetyPage            from './pages/safety/SafetyPage'
import MyDispatcherPage      from './pages/dispatcher/MyDispatcherPage'
import DispatcherProfilePage from './pages/dispatcher/DispatcherProfilePage'
import ContractsPage         from './pages/contracts/ContractsPage'
import AIAssistantPage       from './pages/ai/AIAssistantPage'
import RatesPage             from './pages/rates/RatesPage'
import FactoringPage        from './pages/factoring/FactoringPage'
import TripManagementPage   from './pages/tms/TripManagementPage'
import BrokerCRMPage        from './pages/tms/BrokerCRMPage'
import CustomerManagementPage from './pages/tms/CustomerManagementPage'
import OnboardingWizardPage  from './pages/onboarding/OnboardingWizardPage'
import IntegrationHubPage    from './pages/integrations/IntegrationHubPage'
import DriverRecruitmentPage from './pages/company/DriverRecruitmentPage'
import NotificationCenterPage from './pages/notifications/NotificationCenterPage'
import PublicLoadTrackerPage  from './pages/tracking/PublicLoadTrackerPage'
import FMCSALookupPage        from './pages/fmcsa/FMCSALookupPage'
import DetentionTimerPage    from './pages/detention/DetentionTimerPage'
import CostPerMilePage       from './pages/finance/CostPerMilePage'
import AccessorialChargesPage from './pages/finance/AccessorialChargesPage'
import IFTAFilingPage         from './pages/ifta/IFTAFilingPage'
import LoadCalendarPage       from './pages/calendar/LoadCalendarPage'
import DeadHeadOptimizerPage  from './pages/deadhead/DeadHeadOptimizerPage'
import DVIRPage               from './pages/dvir/DVIRPage'
import EPODPage               from './pages/epod/EPODPage'
import LaneHeatmapPage        from './pages/lanes/LaneHeatmapPage'
import FuelOptimizerPage      from './pages/fuel-optimizer/FuelOptimizerPage'
import CarrierScorecardPage   from './pages/scorecard/CarrierScorecardPage'
import ClaimsDamagePage       from './pages/claims/ClaimsDamagePage'
import LoadNegotiationPage    from './pages/dispatcher/LoadNegotiationPage'
import PayoutTrackerPage      from './pages/dispatcher/PayoutTrackerPage'
import AIMatchPage            from './pages/dispatcher/AIMatchPage'
import DealTrackerPage        from './pages/dispatcher/DealTrackerPage'
import DriverCommsPage        from './pages/dispatcher/DriverCommsPage'
import DispatcherPnLPage      from './pages/dispatcher/DispatcherPnLPage'
import EmergencyLoadPage      from './pages/dispatcher/EmergencyLoadPage'
import RCAnalyzerPage         from './pages/dispatcher/RCAnalyzerPage'
import BackhaulFinderPage     from './pages/dispatcher/BackhaulFinderPage'
import ProactiveDispatchPage  from './pages/dispatcher/ProactiveDispatchPage'
import LoadDocFlowPage        from './pages/dispatcher/LoadDocFlowPage'
import MarketRateIntelPage    from './pages/dispatcher/MarketRateIntelPage'
import OwnerOpFindDispatcherPage from './pages/marketplace/OwnerOpFindDispatcherPage'
import DispatcherOpportunitiesPage from './pages/dispatcher/DispatcherOpportunitiesPage'
import DispatcherVerificationPage from './pages/dispatcher/DispatcherVerificationPage'
import DispatcherSkillsTestPage   from './pages/dispatcher/DispatcherSkillsTestPage'
import DispatcherAcademyPage      from './pages/academy/DispatcherAcademyPage'
import BrokerTrustNetworkPage       from './pages/brokers/BrokerTrustNetworkPage'
import LoadStatusProtocolPage      from './pages/loads/LoadStatusProtocolPage'
import QuickPayPage                from './pages/finance/QuickPayPage'
import SmartContractBuilderPage    from './pages/contracts/SmartContractBuilderPage'
import DispatcherScorecardPage     from './pages/dispatcher/DispatcherScorecardPage'
import DispatcherWorkspacePage     from './pages/dispatcher/DispatcherWorkspacePage'
import EarningsCalculatorPage      from './pages/dispatcher/EarningsCalculatorPage'
import DispatcherPublicProfilePage from './pages/dispatcher/DispatcherPublicProfilePage'
import GrowthReferralPage          from './pages/growth/GrowthReferralPage'

// ── Placeholder pages ─────────────────────────────────────────────────────────
function Placeholder({ title, icon }: { title: string; icon: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16, color: '#A0AEC0' }}>
      <div style={{ fontSize: 64 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#2D3748' }}>{title}</div>
      <div style={{ fontSize: 14 }}>This module is coming soon</div>
    </div>
  )
}

// ── Page router ───────────────────────────────────────────────────────────────
function PageContent({ role, page, userName, onNavigate, dispatcherIsNew }: { role: UserRole; page: string; userName: string; onNavigate: (p: string) => void; dispatcherIsNew: boolean }) {
  // ── Shared pages (available to all roles) ──────────────────────────────────
  if (page === 'marketplace') return <DispatcherMarketplace />
  if (page === 'loads')       return <LoadBoardPage />
  if (page === 'finance')     return <FinancePage role={role} />
  if (page === 'tracking')    return <TrackingPage />
  if (page === 'chat')        return <ChatPage />
  if (page === 'post-load')   return <PostLoadPage onNavigate={onNavigate} />
  if (page === 'shipments')   return <ShipmentsPage onNavigate={onNavigate} />
  if (page === 'clients')     return <ClientsPage />
  if (page === 'fleet')       return <FleetPage />
  if (page === 'drivers')     return <DriversPage />
  if (page === 'analytics')   return <AnalyticsPage role={role} />
  if (page === 'docs')        return <DocumentsPage />
  if (page === 'settings' || page === 'profile') return <SettingsPage />
  if (page === 'route')        return <RoutePlannerPage />
  if (page === 'compliance')   return <CompliancePage />
  if (page === 'maintenance')     return <MaintenancePage />
  if (page === 'invoices')        return <InvoicesPage role={role} />
  if (page === 'payroll')         return <PayrollPage />
  if (page === 'dispatch-board')  return <DispatchBoardPage />
  if (page === 'fuel')            return <FuelLogPage />
  if (page === 'reports')         return <ReportsPage />
  if (page === 'safety')               return <SafetyPage />
  if (page === 'my-dispatcher')        return <MyDispatcherPage onNavigate={onNavigate} />
  if (page === 'dispatcher-profile')   return <DispatcherProfilePage />
  if (page === 'contracts')            return <ContractsPage role={role} />
  if (page === 'ai')                   return <AIAssistantPage role={role} />
  if (page === 'rates')                return <RatesPage />
  if (page === 'factoring')            return <FactoringPage />
  if (page === 'trips')                return <TripManagementPage role={role} />
  if (page === 'broker-crm')           return <BrokerCRMPage />
  if (page === 'customers')            return <CustomerManagementPage />
  if (page === 'onboarding')           return <OnboardingWizardPage role={role} userName={userName} onComplete={() => onNavigate('dashboard')} />
  if (page === 'integrations')         return <IntegrationHubPage />
  if (page === 'driver-recruitment')   return <DriverRecruitmentPage />
  if (page === 'notifications')        return <NotificationCenterPage role={role} />
  if (page === 'public-tracker')       return <PublicLoadTrackerPage />
  if (page === 'fmcsa')                return <FMCSALookupPage />
  if (page === 'detention')            return <DetentionTimerPage role={role} />
  if (page === 'cpm')                  return <CostPerMilePage role={role} />
  if (page === 'accessorial')          return <AccessorialChargesPage role={role} />
  if (page === 'ifta')                 return <IFTAFilingPage role={role} />
  if (page === 'calendar')             return <LoadCalendarPage role={role} />
  if (page === 'deadhead')             return <DeadHeadOptimizerPage role={role} />
  if (page === 'dvir')                 return <DVIRPage role={role} />
  if (page === 'epod')                 return <EPODPage role={role} />
  if (page === 'lane-heatmap')         return <LaneHeatmapPage role={role} />
  if (page === 'fuel-optimizer')       return <FuelOptimizerPage role={role} />
  if (page === 'carrier-scorecard')   return <CarrierScorecardPage role={role} />
  if (page === 'claims')             return <ClaimsDamagePage role={role} />
  if (page === 'load-negotiation')   return <LoadNegotiationPage />
  if (page === 'payout-tracker')     return <PayoutTrackerPage />
  if (page === 'ai-match')           return <AIMatchPage />
  if (page === 'deal-tracker')       return <DealTrackerPage />
  if (page === 'driver-comms')       return <DriverCommsPage />
  if (page === 'dispatcher-pnl')     return <DispatcherPnLPage />
  if (page === 'emergency-load')     return <EmergencyLoadPage />
  if (page === 'rc-analyzer')        return <RCAnalyzerPage />
  if (page === 'backhaul-finder')    return <BackhaulFinderPage />
  if (page === 'proactive-dispatch') return <ProactiveDispatchPage />
  if (page === 'doc-flow')           return <LoadDocFlowPage />
  if (page === 'rate-intel')         return <MarketRateIntelPage />
  if (page === 'find-dispatcher')    return <OwnerOpFindDispatcherPage />
  if (page === 'opportunities')      return <DispatcherOpportunitiesPage />
  if (page === 'verification')       return <DispatcherVerificationPage onNavigate={onNavigate} />
  if (page === 'skills-test')        return <DispatcherSkillsTestPage onNavigate={onNavigate} />
  if (page === 'academy')            return <DispatcherAcademyPage />
  if (page === 'broker-trust')       return <BrokerTrustNetworkPage />
  if (page === 'load-status')        return <LoadStatusProtocolPage />
  if (page === 'quick-pay')          return <QuickPayPage />
  if (page === 'smart-contract')     return <SmartContractBuilderPage />
  if (page === 'dispatcher-scorecard') return <DispatcherScorecardPage />
  if (page === 'workspace')            return <DispatcherWorkspacePage />
  if (page === 'earnings-calculator')  return <EarningsCalculatorPage />
  if (page === 'public-profile')       return <DispatcherPublicProfilePage />
  if (page === 'referral')             return <GrowthReferralPage />

  // ── Role-specific dashboards ───────────────────────────────────────────────
  switch (role) {
    case 'owner-op':
      if (page === 'dashboard') return <OODashboard onNavigate={onNavigate} />
      break
    case 'dispatcher':
      if (page === 'dashboard') return dispatcherIsNew
        ? <NewDispatcherDashboard onNavigate={onNavigate} />
        : <DispatcherDashboard onNavigate={onNavigate} />
      break
    case 'company':
      if (page === 'dashboard') return <CompanyDashboard onNavigate={onNavigate} />
      break
    case 'shipper':
      if (page === 'dashboard') return <ShipperDashboard onNavigate={onNavigate} />
      break
  }

  // ── Fallback for any unknown page ─────────────────────────────────────────
  return <Placeholder title={page} icon="🔧" />
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { profile, loading, signOut } = useAuth()
  const [page, setPage] = useState('dashboard')

  // Demo fallback: when no Supabase session, store role locally
  const [demoRole, setDemoRole]       = useState<UserRole | null>(null)
  const [demoName, setDemoName]       = useState<string>('')
  const [dispatcherIsNew, setDispatcherIsNew] = useState(false)

  // While checking session
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', flexDirection: 'column', gap: 16,
        background: 'var(--c-dark)', color: '#fff',
      }}>
        <div style={{ fontSize: 40 }}>🚛</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>DispaLoadIQ</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>Loading...</div>
      </div>
    )
  }

  // Not authenticated — use mock auth for demo OR real Supabase auth
  if (!profile && !demoRole) {
    return (
      <AuthPage
        onLogin={(role: UserRole, name: string, isNew?: boolean) => {
          setDemoRole(role)
          setDemoName(name)
          setDispatcherIsNew(role === 'dispatcher' && (isNew ?? false))
          setPage('dashboard')
        }}
      />
    )
  }

  const role     = profile?.role     ?? demoRole!
  const userName = profile?.full_name ?? demoName

  return (
    <div className="app-shell">
      <Sidebar
        role={role}
        activePage={page}
        userName={userName}
        onNavigate={setPage}
        onLogout={() => { signOut(); setDemoRole(null); setDemoName(''); setDispatcherIsNew(false) }}
        dispatcherIsNew={role === 'dispatcher' && dispatcherIsNew}
      />
      <div className="main-area">
        <Header
          activePage={page}
          role={role}
          userName={userName}
          notifCount={3}
          onNavigate={setPage}
          onNotifClick={() => setPage('chat')}
        />
        <main className="page-content">
          <PageContent role={role} page={page} userName={userName} onNavigate={setPage} dispatcherIsNew={dispatcherIsNew} />
        </main>
      </div>
    </div>
  )
}
