export type LoadSource = 'own' | '123lb' | 'dat' | 'truckstop'

export interface SourceConfig {
  id: LoadSource
  name: string
  icon: string
  color: string
  bgColor: string
  description: string
  signupUrl: string
  edgeFunction: string | null
  envVars: string[]
}

export const LOAD_SOURCES: SourceConfig[] = [
  {
    id: 'own',
    name: 'DispaLoadIQ',
    icon: '💼',
    color: '#38C770',
    bgColor: '#F0FFF4',
    description: 'Loads posted directly by shippers on your platform',
    signupUrl: '',
    edgeFunction: null,
    envVars: [],
  },
  {
    id: '123lb',
    name: '123Loadboard',
    icon: '📦',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    description: 'Thousands of loads updated in real time from 123Loadboard',
    signupUrl: 'https://www.123loadboard.com/api',
    edgeFunction: 'search-123lb',
    envVars: ['LB123_API_KEY'],
  },
  {
    id: 'dat',
    name: 'DAT',
    icon: '🔷',
    color: '#F97316',
    bgColor: '#FFF7ED',
    description: "North America's largest load board network",
    signupUrl: 'https://developer.dat.com/',
    edgeFunction: 'search-dat',
    envVars: ['DAT_CLIENT_ID', 'DAT_CLIENT_SECRET'],
  },
  {
    id: 'truckstop',
    name: 'Truckstop',
    icon: '🚚',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    description: 'ITS Truckstop — freight matching platform',
    signupUrl: 'https://truckstop.com/partner-integrations/',
    edgeFunction: 'search-truckstop',
    envVars: ['TRUCKSTOP_CLIENT_ID', 'TRUCKSTOP_CLIENT_SECRET'],
  },
]
