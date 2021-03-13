export const transitionsToLabel = (transitions: Set<string>): string => {
    return Array.from(transitions).join(",");
}

export const getStateColor = (isAdmit: boolean, isInitial: boolean): string => {
    if (isAdmit) {
        return "#88ff88";
    }

    return "#fff";
}