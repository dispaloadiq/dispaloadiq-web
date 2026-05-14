// Auto-generated TypeScript types for DispaLoadIQ Supabase schema
// Regenerate with: npx supabase gen types typescript --local > src/lib/database.types.ts

export type UserRole = 'owner-op' | 'dispatcher' | 'company' | 'shipper'

// ── Marketplace helper types ───────────────────────────────────────────────────
export interface PortfolioLoad {
  route: string
  miles: number
  rpm: number
  equipment: string
  date: string
}

export interface MessageMetadata {
  load_id?: string
  rate?: number
  origin?: string
  dest?: string
  document_url?: string
  document_name?: string
  [key: string]: unknown
}

export type LoadStatus =
  | 'posted'
  | 'bidding'
  | 'booked'
  | 'dispatched'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'

export type TripStatus =
  | 'scheduled'
  | 'in_transit'
  | 'delivered'
  | 'issue'

export type ClaimStatus = 'open' | 'disputed' | 'paid' | 'denied'
export type ClaimType   = 'damage' | 'shortage' | 'delay' | 'theft' | 'contamination'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'disputed'

export type ContractStatus = 'draft' | 'pending_sign' | 'active' | 'expired' | 'terminated'

export interface Database {
  public: {
    Tables: {
      // ── User Profiles ────────────────────────────────────────────────────────
      user_profiles: {
        Row: {
          id: string                  // auth.users.id (UUID)
          role: UserRole
          full_name: string
          email: string
          phone: string | null
          company_name: string | null
          mc_number: string | null
          dot_number: string | null
          avatar_url: string | null
          state: string | null
          city: string | null
          home_base: string | null    // "Dallas, TX"
          equipment_types: string[]   // ["Dry Van", "Reefer"]
          is_verified: boolean
          stripe_customer_id: string | null
          subscription_tier: 'free' | 'pro' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }

      // ── Loads (Load Board) ────────────────────────────────────────────────────
      loads: {
        Row: {
          id: string
          shipper_id: string          // user_profiles.id
          dispatcher_id: string | null
          carrier_id: string | null
          status: LoadStatus
          origin_city: string
          origin_state: string
          origin_zip: string | null
          destination_city: string
          destination_state: string
          destination_zip: string | null
          pickup_date: string         // ISO date
          delivery_date: string | null
          commodity: string
          weight_lbs: number | null
          length_ft: number | null
          equipment_type: string      // "Dry Van", "Reefer", "Flatbed", "Step Deck"
          load_type: 'FTL' | 'LTL' | 'Partial'
          rate: number | null         // offered rate in USD
          rate_per_mile: number | null
          miles: number | null
          special_requirements: string | null
          hazmat: boolean
          team_required: boolean
          notes: string | null
          reference_number: string | null
          broker_name: string | null
          broker_mc: string | null
          bids_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['loads']['Row'],
          'id' | 'bids_count' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['loads']['Insert']>
      }

      // ── Load Bids ─────────────────────────────────────────────────────────────
      load_bids: {
        Row: {
          id: string
          load_id: string
          bidder_id: string           // carrier or dispatcher
          amount: number
          message: string | null
          status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['load_bids']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['load_bids']['Insert']>
      }

      // ── Trips (TMS) ───────────────────────────────────────────────────────────
      trips: {
        Row: {
          id: string
          load_id: string | null
          driver_id: string           // user_profiles.id
          dispatcher_id: string | null
          company_id: string | null
          status: TripStatus
          origin: string
          destination: string
          pickup_date: string
          delivery_date: string | null
          actual_delivery: string | null
          miles: number | null
          rate: number
          driver_pay: number | null
          fuel_cost: number | null
          tolls: number | null
          other_cost: number | null
          net_profit: number | null
          truck_id: string | null
          trailer_id: string | null
          commodity: string | null
          weight_lbs: number | null
          current_lat: number | null
          current_lng: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['trips']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['trips']['Insert']>
      }

      // ── Fleet (Trucks) ────────────────────────────────────────────────────────
      fleet: {
        Row: {
          id: string
          company_id: string
          unit_number: string
          make: string
          model: string
          year: number
          vin: string | null
          plate: string | null
          plate_state: string | null
          equipment_type: string
          status: 'active' | 'maintenance' | 'out_of_service'
          mileage: number | null
          assigned_driver_id: string | null
          insurance_expiry: string | null
          registration_expiry: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['fleet']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['fleet']['Insert']>
      }

      // ── Dispatcher-Carrier Relationships ──────────────────────────────────────
      dispatcher_clients: {
        Row: {
          id: string
          dispatcher_id: string
          carrier_id: string
          status: 'pending' | 'active' | 'paused' | 'terminated'
          contract_id: string | null
          commission_type: 'flat' | 'percent'
          commission_value: number    // flat $ or percent
          started_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['dispatcher_clients']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['dispatcher_clients']['Insert']>
      }

      // ── Claims & Damage ───────────────────────────────────────────────────────
      claims: {
        Row: {
          id: string
          claimant_id: string
          load_id: string | null
          trip_id: string | null
          claim_type: ClaimType
          status: ClaimStatus
          commodity: string
          origin: string
          destination: string
          incident_date: string
          filed_date: string
          resolved_date: string | null
          damage_amount: number
          settled_amount: number | null
          deductible: number
          broker_name: string | null
          carrier_name: string | null
          insurance_company: string | null
          policy_number: string | null
          description: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['claims']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['claims']['Insert']>
      }

      // ── Claim Messages ────────────────────────────────────────────────────────
      claim_messages: {
        Row: {
          id: string
          claim_id: string
          sender_id: string | null
          sender_type: 'user' | 'broker' | 'insurance' | 'system'
          sender_name: string
          message: string
          attachment_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['claim_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['claim_messages']['Insert']>
      }

      // ── Invoices ──────────────────────────────────────────────────────────────
      invoices: {
        Row: {
          id: string
          owner_id: string
          trip_id: string | null
          load_id: string | null
          invoice_number: string
          status: InvoiceStatus
          bill_to_name: string
          bill_to_email: string | null
          amount: number
          tax: number | null
          total: number
          due_date: string
          paid_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
      }

      // ── Contracts ─────────────────────────────────────────────────────────────
      contracts: {
        Row: {
          id: string
          creator_id: string
          counterparty_id: string | null
          title: string
          status: ContractStatus
          contract_type: 'dispatcher_agreement' | 'carrier_agreement' | 'broker_agreement' | 'other'
          start_date: string | null
          end_date: string | null
          value: number | null
          terms: string | null
          signed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['contracts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['contracts']['Insert']>
      }

      // ── Fuel Log ──────────────────────────────────────────────────────────────
      fuel_logs: {
        Row: {
          id: string
          user_id: string
          trip_id: string | null
          truck_id: string | null
          date: string
          location: string
          state: string
          gallons: number
          price_per_gallon: number
          total_cost: number
          odometer: number | null
          fuel_type: 'diesel' | 'def' | 'gasoline'
          card_used: string | null
          receipt_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['fuel_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['fuel_logs']['Insert']>
      }

      // ── Maintenance ───────────────────────────────────────────────────────────
      maintenance_records: {
        Row: {
          id: string
          company_id: string
          truck_id: string | null
          unit_number: string
          service_type: string
          description: string
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'critical'
          service_date: string
          completed_date: string | null
          odometer: number | null
          cost: number | null
          vendor: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['maintenance_records']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['maintenance_records']['Insert']>
      }

      // ── Notifications ─────────────────────────────────────────────────────────
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string
          data: Record<string, unknown> | null
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }

      // ── AI Chat Messages ──────────────────────────────────────────────────────
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ai_conversations']['Row'], 'id' | 'created_at'>
        Update: never
      }

      // ── Dispatcher Profiles (Marketplace) ─────────────────────────────────────
      dispatcher_profiles: {
        Row: {
          user_id: string
          bio: string | null
          trust_score: number
          verification_status: 'unverified' | 'pending' | 'verified' | 'certified'
          languages: string[]
          specialties: string[]
          active_states: string[]
          commission_rate: number
          min_rpm: number
          response_time_min: number
          availability: 'available' | 'busy' | 'limited'
          max_clients: number
          current_clients: number
          total_loads: number
          avg_rpm: number
          on_time_rate: number
          client_retention: number
          certifications: string[]
          skills_score: number
          english_score: number
          identity_verified: boolean
          portfolio_loads: PortfolioLoad[]
          stripe_account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['dispatcher_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['dispatcher_profiles']['Insert']>
      }

      // ── Conversations ─────────────────────────────────────────────────────────
      conversations: {
        Row: {
          id: string
          participant_a: string
          participant_b: string
          last_message: string | null
          last_message_at: string | null
          unread_a: number
          unread_b: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }

      // ── Messages ──────────────────────────────────────────────────────────────
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          message_type: 'text' | 'load_share' | 'document' | 'system'
          metadata: MessageMetadata | null
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }

      // ── Dispatcher Relationships ──────────────────────────────────────────────
      dispatcher_relationships: {
        Row: {
          id: string
          owner_op_id: string
          dispatcher_id: string
          status: 'pending' | 'active' | 'paused' | 'terminated'
          commission_rate: number
          min_rpm_guarantee: number | null
          contract_id: string | null
          started_at: string | null
          ended_at: string | null
          total_loads: number
          avg_rpm: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['dispatcher_relationships']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['dispatcher_relationships']['Insert']>
      }

      // ── Dispatcher Reviews ────────────────────────────────────────────────────
      dispatcher_reviews: {
        Row: {
          id: string
          dispatcher_id: string
          reviewer_id: string
          relationship_id: string | null
          rating: number
          text: string | null
          loads_completed: number
          avg_rpm_achieved: number | null
          verified: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['dispatcher_reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['dispatcher_reviews']['Insert']>
      }
    }

    Views: {
      // Enriched loads view (joins shipper profile)
      loads_with_shipper: {
        Row: Database['public']['Tables']['loads']['Row'] & {
          shipper_name: string
          shipper_mc: string | null
        }
      }
    }

    Functions: {
      get_lane_stats: {
        Args: { p_origin_state: string; p_destination_state: string }
        Returns: {
          avg_rate: number
          avg_rpm: number
          trip_count: number
          avg_miles: number
        }[]
      }
    }

    Enums: {
      user_role: UserRole
      load_status: LoadStatus
      trip_status: TripStatus
      claim_status: ClaimStatus
      claim_type: ClaimType
    }
  }
}

// ── Convenience Row types ──────────────────────────────────────────────────────
export type UserProfile        = Database['public']['Tables']['user_profiles']['Row']
export type Load               = Database['public']['Tables']['loads']['Row']
export type LoadInsert          = Database['public']['Tables']['loads']['Insert']
export type Trip               = Database['public']['Tables']['trips']['Row']
export type Claim              = Database['public']['Tables']['claims']['Row']
export type ClaimMessage       = Database['public']['Tables']['claim_messages']['Row']
export type Invoice            = Database['public']['Tables']['invoices']['Row']
export type Contract           = Database['public']['Tables']['contracts']['Row']
export type FuelLog            = Database['public']['Tables']['fuel_logs']['Row']
export type MaintenanceRecord  = Database['public']['Tables']['maintenance_records']['Row']
export type Notification       = Database['public']['Tables']['notifications']['Row']
export type Fleet              = Database['public']['Tables']['fleet']['Row']
export type AIMessage          = Database['public']['Tables']['ai_conversations']['Row']

// ── Marketplace convenience types ─────────────────────────────────────────────
export type DispatcherProfile       = Database['public']['Tables']['dispatcher_profiles']['Row']
export type DispatcherProfileInsert = Database['public']['Tables']['dispatcher_profiles']['Insert']
export type Conversation            = Database['public']['Tables']['conversations']['Row']
export type Message                 = Database['public']['Tables']['messages']['Row']
export type MessageInsert           = Database['public']['Tables']['messages']['Insert']
export type DispatcherRelationship  = Database['public']['Tables']['dispatcher_relationships']['Row']
export type DispatcherReview        = Database['public']['Tables']['dispatcher_reviews']['Row']

// ── Joined types (from Supabase select with relations) ─────────────────────────
export type DispatcherProfileWithUser = DispatcherProfile & {
  user_profiles: Pick<UserProfile, 'full_name' | 'avatar_url' | 'city' | 'state' | 'is_verified'>
}
