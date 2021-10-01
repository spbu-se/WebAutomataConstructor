export interface NodeCore  {
    id: number
    isAdmit: boolean
    stack?: string[]
}

export interface EdgeCore  {
    from: number
    to: number
    transitions: Set<string>
    stackDown?: string
    stackPush?: string[]
}

export interface GraphCore  {
    nodes: NodeCore[]
    edges: EdgeCore[]
}