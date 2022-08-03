import { History, HistTrace, HistUnit, position, Step } from "./Types";
import { GraphCore, NodeCore, Move, EdgeCore } from "./IGraphTypes";
import { NonDeterministic } from "./Exceptions";
import { BOTTOM, Computer, EPS, statementCell } from "./Computer";


export class activeTransition extends Computer { 

    public curPosition: position[];


    private isTransitionActive(value: NodeCore): boolean {
        if (value.countTags !== 0)
            return true
        return false;
    }
    //здесь получаем набор ребер с одинаковым названием и делаем так, чтобы из вершины фром или вершин фром отнялась одна метка а в ту 
    // прибавилась одна
    private changeCountTags(value: EdgeCore[]): void {
        
        value.forEach(value1 => {
                this.startStatements.forEach(value2 => {
                    if (value2.id === value1.from) {
                        this.minusTag(value2)
                    }
                    if (value2.id === value1.to) {
                        this.plusTag(value2)
                    }
                })   
            }
        )
        this.startStatements.forEach(value3 => value3.isChangedTags = false)
    }


    private minusTag(value: NodeCore): void {
        if ((value.countTags !== undefined) && (!value.isChangedTags)) {
            value.countTags--;
            value.isChangedTags = true;
        }
    }

    private plusTag(value: NodeCore): void {
        if ((value.countTags !== undefined) && (!value.isChangedTags)) {
            value.countTags++;
            value.isChangedTags = true;
        }
    }

    private getNodeIdFrom(edge: EdgeCore): number {
        return edge.from;
    }

    private getNodeIdTo(edge: EdgeCore): number {
        return edge.to;
    }

    public setInput = (input: string[]) => {
        this.input = []
        input.forEach(value => {
            this.input.push({ idLogic: this.alphabet.get(value), value: value })
        })
        this.restart()
    }

    public haveEpsilon = () => this.alphabet.get(EPS) !== undefined

    constructor(graph: GraphCore, startStatement: NodeCore[], input: string[]) {
        super(graph, startStatement)
        this.changeCountTags 
    }

    protected _step = (counter: number, trace: number, history: History[], unitHsit: HistUnit[]): Step => {
        let newPosSet: position[] = []
        
        const updCurPos = () => {
            this.curPosition = []
            newPosSet.forEach(value => this.curPosition.push(value))
            newPosSet = []
        }

        

    }



}