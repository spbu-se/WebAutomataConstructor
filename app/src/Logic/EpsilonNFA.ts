import {HistTrace, HistUnit, position, Step} from "./Types";
import {EdgeCore, GraphCore, NodeCore, TransitionParams} from "./IGraphTypes";
import {ImSet, PDA} from "./PDA";
import {cloneDeep} from "lodash";
import { EPS } from "./Computer";
import { Stack } from "./Stack";


export class EpsilonNFA extends PDA {

    constructor(graph: GraphCore, startStatement: NodeCore[], input: string[]) {
        super(graph, startStatement, input)
    }

    protected enfaStep = (): Step => {
        const histUnit: HistUnit[] = []
        let ret = this._step(
            this.counterSteps,
            this.alphabet.get(this.input[this.counterSteps]?.value),
            this.historiStep,
            histUnit,
            []
        )

        this.counterSteps = ret.counter
        this.historiStep = ret.history
        ret.nodes.forEach(value => value.stack = undefined)
        ret.history.forEach(value => value.nodes.forEach(value1 => value1.stack = undefined))

        return ret
    }

    protected enfaRun = (): Step => {
        const histUnit: HistUnit[] = []
        const histTrace: HistTrace[] = []

        this.historiRun = []
        this.counterStepsForResult = 0

        for (let i = 0; i < this.input.length - 1; i++) {
            let tmp = this._step(
                this.counterStepsForResult,
                this.alphabet.get(this.input[this.counterStepsForResult].value),
                this.historiRun,
                histUnit,
            []
            )
            this.counterStepsForResult = tmp.counter
            this.historiRun = tmp.history
            histTrace.push({byEpsPred: tmp.byEpsPred, byLetter: tmp.byLetter, byEpsAfter: tmp.byEpsAfter})

        }

        let ret = this._step(
            this.counterStepsForResult,
            this.alphabet.get(this.input[this.counterStepsForResult].value),
            this.historiRun,
            histUnit,
            []
        )
        histTrace.push({byEpsPred: ret.byEpsPred, byLetter: ret.byLetter, byEpsAfter: ret.byEpsAfter})

        ret.nodes.forEach(value => value.stack = undefined)
        ret.history.forEach(value => value.nodes.forEach(value1 => value1.stack = undefined))

        console.log('histTrace')
        console.log(histTrace)
        console.log('histTrace')

        return {...ret, histTrace}
    }

    nfaToDfa = (): GraphCore => {
        const startIds = this.startStatements.map((v) => v.id)
        const fakeEdges = [...this.edges]
        startIds.forEach((v) => fakeEdges.push({
            from: 999,
            to: v,
            transitions: new Set<TransitionParams[]>([[{ title: EPS }]]),
            localValue: []
        }))
        const fakeStart = { id: 999, isAdmit: false }
        const fakeNodes: NodeCore[] = [fakeStart, ...this.nodes]
        const fakeAutomat = new EpsilonNFA({ edges: fakeEdges, nodes: fakeNodes }, [fakeStart], [])

        console.log(fakeAutomat)

        const nextStepPosition = (position: position, by: number): position[] => {
            return fakeAutomat.cellMatrix(position.stmt.idLogic, by).map(v => ({ stmt: v }))
        }

        const _nextStepPositions = (positions: position[], by: number): position[] => {
            let acc: position[] = []
            positions.map((v) =>
                nextStepPosition(v, by)).forEach((ps) =>
                    ps.forEach((p) => acc.push(p)))
            return acc
        }

        const nextStepPositions = (positions: position[], by: number): position[] => {

            const afterEps = (positions: position[]): position[] => {
                if (fakeAutomat.epsId === undefined) {
                    return positions
                }
                const acc: position[][] = []
                const EPStack = new Stack<string>()
                EPStack.push(EPS)
                positions.forEach((position) => {
                    const tmp = fakeAutomat.epsilonStep(position.stmt.idLogic, EPS, EPStack, [])
                    if (tmp !== undefined) {
                        acc.push(tmp)
                    }
                })

                const flatted: position[] = []
                acc.forEach((ps) => ps.forEach((p) => flatted.push(p)))

                return flatted
            }

            return afterEps(_nextStepPositions(afterEps(positions), by))
        }

        const pop = () => stack.shift()

        const push = (v: position[]): void => {
            stack.push(v)
        }

        fakeAutomat.restart()

        const stack: position[][] = []
        const table: position[][][] = []
        const set: ImSet<position[]> = new ImSet<position[]>()
        const startPos = fakeAutomat.curPosition

        push(startPos)

        while (stack.length > 0) {
            let head = pop()
            let acc: position[][] = []


            if (head === undefined || head.length < 1) {
                break;
            }
            if (set.has(head)) {
                continue
            }
            set.add(head.map((v) => (
                {
                    stmt: {
                        id: v.stmt.id,
                        idLogic: v.stmt.idLogic,
                        isAdmit: v.stmt.isAdmit
                    },
                    stack: undefined
                }))
            )

            fakeAutomat.getAlphabet().forEach((value) => {
                if (value !== fakeAutomat.epsId) {
                    let to: position[] = nextStepPositions(head!, value)
                    const wasPushed: number[] = []
                    let __to: position[] = to.map((v) => {
                        if (wasPushed.includes(v.stmt.idLogic)) {
                            return {stmt: {id: -100, idLogic: -100, isAdmit: false}, stack: undefined}
                        }
                        wasPushed.push(v.stmt.idLogic)
                        return (
                            {
                                stmt: {
                                    id: v.stmt.id,
                                    idLogic: v.stmt.idLogic,
                                    isAdmit: v.stmt.isAdmit
                                },
                                stack: undefined
                            })
                    }
                    )
                    const _to: position[] = __to.filter((v) => v?.stmt.idLogic !== -100)
                    acc.push(_to)
                    if (to.length > 0 && !set.has(to) && !set.has(_to)) {
                        push(_to)
                    }
                }
            })
            table.push(acc)
        }

        const _edges: EdgeCore[] = []
        table.forEach((ps, from) => {
            fakeAutomat.getAlphabet().forEach((tr, letter) => {
                if (tr !== fakeAutomat.epsId && ps[tr].length !== 0) {
                    _edges.push({
                        from: from,
                        to: set.getIter(ps[tr]),
                        transitions: new Set<TransitionParams[]>([[{ title: letter }]])
                    })
                }
            })
        })

        const nodes: NodeCore[] = set.getStorage().map((v) => ({
            id: set.getIter(v),
            isAdmit: fakeAutomat.haveAdmitting(v),
        }))

        const edges: EdgeCore[] = []

        _edges.sort((a, b) => a.from - b.from || a.to - b.to)
        const newEdges: EdgeCore[] = []
        for (let i = 0; i < _edges.length; i++) {
            const acc: TransitionParams[] = []
            let delta = 0
            let j = i
            while (j < _edges.length && _edges[i].from === _edges[j].from && _edges[i].to === _edges[j].to) {
                let tmp: string = ''
                _edges[j].transitions.forEach((_) => _.forEach((v) => tmp = v.title))
                acc.push({ title: tmp })

                j++
            }
            i = j - 1

            edges.push({
                from: _edges[i].from,
                to: _edges[i].to,
                transitions: new Set<TransitionParams[]>([acc])
            })

        }

        return { nodes: nodes, edges: edges }
    }

    step = this.enfaStep

    run = this.enfaRun
}

