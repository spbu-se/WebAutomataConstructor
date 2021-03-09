export interface nodeCore {
    id: number
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