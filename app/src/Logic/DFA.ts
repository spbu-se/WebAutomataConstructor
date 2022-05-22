import { EdgeCore, GraphCore, GraphEval, NodeCore, TransitionParams } from "./IGraphTypes";
import { EpsilonNFA } from "./EpsilonNFA";
import { position, statement, Step } from "./Types";
import { NonDeterministic, NonMinimizable } from "./Exceptions";
import { statementCell } from "./Computer";

export class DFA extends EpsilonNFA {
    constructor(graph: GraphCore, startStatement: NodeCore[], input: string[]) {
        super(graph, startStatement, input)
        this.setInput(input)
    }

    minimizeDfa = (): GraphEval => {
        this.restart()
        const startId = this.curPosition[0].stmt.idLogic

        type groupElement = {
            number: number
            node: statement,
        }

        const cutBy = (by: number): statementCell[] => {
            const acc: statementCell[] = []
            this.matrix.forEach((_, it) => acc.push(this.cellMatrix(it, by)[0]))
            return acc
        }

        const _lookUp = (group: groupElement[]) => (id: number): groupElement => {
            return group[id]
        }

        const _getJump = (table: groupElement[][]) => (by: number) => (id: number): groupElement => {
            return table[by][id]
        }

        const createTableT = (zero: groupElement[]): groupElement[][] => {
            const lookUp = _lookUp(zero)
            const table: groupElement[][] = []
            this.alphabet.forEach((tr) => {
                const acc: groupElement[] = []
                const cutted = cutBy(tr)
                cutted.forEach((cell) => {
                    acc.push(lookUp(cell.idLogic))
                })
                table.push(acc)
            })
            return table
        }

        const _updateGroups = (zero: groupElement[]) => (groups: groupElement[][]) => (getJump: (id: number) => groupElement) => (group: groupElement[]): { fst: groupElement[], snd: groupElement[] } => {
            const jmpGrp = getJump(group[0].node.idLogic).number
            const newGrp: groupElement[] = []
            const newNumber = groups.length + 1
            const toRm: number[] = []

            group.forEach((value, index) => {
                if (getJump(value.node.idLogic).number !== jmpGrp) {
                    value.number = newNumber
                    toRm.push(value.node.idLogic)
                    newGrp.push(value)
                }
            })

            for (let i = 0; i < group.length; i++) {
                if (toRm.includes(group[i].node.idLogic)) {
                    group.splice(i, 1)
                    i--
                }
            }

            if (newGrp.length > 0) {
                groups.push(newGrp)
                return { fst: group, snd: newGrp }
            }
            return { fst: [], snd: [] }
        }

        const stack: groupElement[][] = []

        const pop = (): groupElement[] | undefined => stack.shift()

        const push = (v: groupElement[]) => stack.push(v)

        const zero: groupElement[] = []
        const first: groupElement[] = []
        const second: groupElement[] = []
        this.statements.forEach((statement) => {
            let element: groupElement = { number: -1, node: { idLogic: -1, id: -1, isAdmit: false } }
            if (statement.isAdmit) {
                element = { number: 1, node: statement }
                first.push(element)
            } else {
                element = { number: 2, node: statement }
                second.push(element)
            }
            zero.push(element)
        })

        const byEveryLetter =
            this.matrix.reduce((acc, line) =>
                acc && line.reduce((accLine: boolean, cells) => accLine && cells.length > 0, acc)
                , true)

        if (first.length < 1 || !byEveryLetter) {
            throw new NonMinimizable()
        }

        const groups: groupElement[][] = []
        groups.push(first)
        groups.push(second)

        const table = createTableT(zero)

        this.alphabet.forEach((tr) => {
            groups.forEach((stmt) => push(stmt))
            const getJump = _getJump(table)(tr)
            const updateGroups = _updateGroups(zero)(groups)(getJump)
            while (stack.length > 0) {
                const head = pop()
                if (head === undefined) {
                    break
                }
                const newGrp = updateGroups(head)
                if (newGrp.fst.length > 0) {
                    push(newGrp.fst)
                    push(newGrp.snd)
                }
            }
        })

        const toPositions = (group: groupElement[]): position[] => group.map((g) => ({ stmt: g.node }))

        const grpAfterJmp = (group: groupElement[], by: number): number => _getJump(table)(by)(group[0].node.idLogic).number

        const nodes: NodeCore[] = groups.map((group) => ({ id: group[0].number, isAdmit: this.haveAdmitting(toPositions(group)) }))
        const edges: EdgeCore[] = groups.reduce((acc: EdgeCore[], g) => {
            this.alphabet.forEach((tr, letter) => {
                acc.push({
                    from: g[0].number,
                    to: grpAfterJmp(g, tr),
                    transitions: new Set<TransitionParams[]>([[{ title: letter }]])
                })
            })
            return acc
        }, [])


        edges.sort((a, b) => a.from - b.from || a.to - b.to)
        const newEdges: EdgeCore[] = []
        for (let i = 0; i < edges.length; i++) {
            const acc: TransitionParams[] = []
            let delta = 0
            let j = i
            while (j < edges.length && edges[i].from === edges[j].from && edges[i].to === edges[j].to) {
                let tmp: string = ''
                edges[j].transitions.forEach((_) => _.forEach((v) => tmp = v.title))
                acc.push({ title: tmp })

                j++
            }
            i = j - 1

            newEdges.push({
                from: edges[i].from,
                to: edges[i].to,
                transitions: new Set<TransitionParams[]>([acc])
            })

        }

        const startGrp = groups.filter((g) => {
            const gIds = g.map(v => v.node.idLogic)
            return gIds.includes(startId)
        })

        const start = nodes[startGrp[0][0].number - 1]

        return { graphcore: { nodes: nodes, edges: newEdges }, start }
    }

    step = (): Step => {
        if (!super.isDeterministic()) {
            throw new NonDeterministic()
        }
        return this.enfaStep()
    }

    run = (): Step => {
        if (!super.isDeterministic()) {
            throw new NonDeterministic()
        }
        return this.enfaRun()
    }
}
