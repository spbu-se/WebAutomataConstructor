export interface nodeCore {
    id: number
    isAdmit: boolean
}

export interface edgeCore {
    from: number
    to: number
    localValue: string[]
}

export interface graphCore {
    nodes: nodeCore[]
    edges: edgeCore[]
}