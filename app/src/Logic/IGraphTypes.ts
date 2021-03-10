export interface nodeCore {
    id: number
    isAdmit: boolean
}

export interface edgeCore {
    from: number
    to: number
    value: string
}

export interface graph {
    nodes: nodeCore[]
    edges: edgeCore[]
}