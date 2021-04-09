import {graph} from "./react-graph-vis-types";

export const transitionsToLabel = (transitions: Set<string>): string => {
    return Array.from(transitions).join(",");
}

export const decorateGraph = (graph: graph): graph => {
    graph.nodes.forEach(node => {
        const border = node.isInitial ? "#0041d0" : node.isAdmit ? "#ff0072" : "#000000"
        const background = node.isCurrent ? "#ffff55" : "#ffffff";
        const borderWidth = {
            default: 1.5,
            primary: 2,
            highlight: 4
        };

        node.color = {
            background: background,
            border: border,
            highlight: {
                border: border,
                background: background
            }
        };
        node.borderWidth = node.isInitial || node.isAdmit ? borderWidth.primary : borderWidth.default;
        node.borderWidthSelected = borderWidth.highlight;
    })

    return graph;
}