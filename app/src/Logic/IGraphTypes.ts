
export interface nodeCore  {
    id: number
    isAdmit: boolean
}

export interface edgeCore  {
    from: number
    to: number
    transitions: Set<string>
    localValue?: string[]
}

export interface graphCore  {
    nodes: nodeCore[]
    edges: edgeCore[]
}