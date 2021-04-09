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

export const getNodeNamePrefix = (graph: graph): string => {
    let prefix = graph.nodes.length === 0 ? "" : graph.nodes[0].label;

    graph.nodes.forEach(node => {
        let i = 0;
        while (i < node.label.length && i < prefix.length && node.label[i] === prefix[i]) {i++;}
        prefix = prefix.substring(0, i);
    });

    return prefix;
}