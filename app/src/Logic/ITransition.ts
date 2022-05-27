type functionTransition = (func: any) => any 

export interface Transition {
    getTransitionFromFunc: (foo : functionTransition) => Set<string>
}