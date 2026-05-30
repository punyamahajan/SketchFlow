export interface Intent {
  product_name: string
  product_type: string
  user_goal: string
  screens: string[]
  features: string[]
  user_roles: string[]
  user_flows: string[]
  detected_ui: string[]
  layout_notes: string
  assumptions: string[]
  open_questions: string[]
}

export interface IntentRecord {
  id: string
  project_id: string
  extracted_intent_json: Intent
  edited_intent_json: Intent | null
  user_confirmed: boolean
  final_intent: Intent
  created_at: string
}

export interface AuditItem {
  name?: string
  reason?: string
  flow?: string
  steps?: string[]
  screen?: string
  state?: string
  description?: string
  category?: string
  requirement?: string
  area?: string
  issue?: string
  recommendation?: string
  impact?: string
  priority?: string
}

export interface Audit {
  missing_screens: AuditItem[]
  missing_user_flows: AuditItem[]
  missing_ui_states: AuditItem[]
  industry_requirements: AuditItem[]
  ux_recommendations: AuditItem[]
  summary: string
}

export interface AuditRecord {
  id: string
  project_id: string
  audit_json: Audit
  created_at: string
}

export interface Blueprint {
  product_overview: { name: string; type: string; goal: string; tech_stack: string[] }
  screen_inventory: Array<{ name: string; route: string; description: string; components: string[]; priority: string }>
  component_inventory: Array<{ name: string; type: string; props: string[]; description: string }>
  user_flows: Array<{ name: string; steps: string[]; screens_involved: string[] }>
  responsive_requirements: { mobile: string[]; tablet: string[]; desktop: string[] }
  accessibility_requirements: string[]
  ui_states: Array<{ component: string; states: string[] }>
  design_system: {
    colors: { primary: string; secondary: string; background: string; text: string; accent: string }
    typography: { headingFont: string; bodyFont: string }
    spacing: string
    borderRadius: string
  }
  recommended_libraries: Array<{ name: string; purpose: string; install: string }>
}

export interface BlueprintRecord {
  id: string
  project_id: string
  blueprint_json: Blueprint
  pdf_path: string | null
  created_at: string
}

export interface GenerationRecord {
  id: string
  project_id: string
  generation_status: 'pending' | 'generating' | 'completed' | 'failed'
  zip_url: string | null
  error_message: string | null
  generated_at: string | null
  created_at: string
}

export interface ProjectState {
  id: string
  title: string
  status: string
  intent?: IntentRecord
  audit?: AuditRecord
  blueprint?: BlueprintRecord
  generation?: GenerationRecord
}
