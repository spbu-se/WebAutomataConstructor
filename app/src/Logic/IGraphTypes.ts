export interface NodeCore  {
    id: number
    isAdmit: boolean
}

export interface EdgeCore  {
    from: number
    to: number
    transitions: Set<string>
}

export interface GraphCore  {
    nodes: NodeCore[]
    edges: EdgeCore[]
}