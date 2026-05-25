export interface ApiResponse {
  status: number
  statusText: string
  data: unknown
  error: string | null
  elapsed: string
}

export interface FieldDef {
  name: string
  ph?: string
  val?: string
  type?: string
  opts?: string[]
}

export interface EndpointDef {
  method: string
  path: string
  fields?: FieldDef[]
  raw?: boolean
  desc?: string
  onSuccess?: (data: unknown) => void
}

export interface ModuleDef {
  id: string
  label: string
  endpoints: EndpointDef[]
}
