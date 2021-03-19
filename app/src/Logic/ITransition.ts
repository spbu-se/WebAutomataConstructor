type functionTransition = (func: any) => any // string/set<string>/... ???

export interface Transition {
    getTransitionFromFunc: (foo : functionTransition) => Set<string>
    //...(....) => Set<string>
}