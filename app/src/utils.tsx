export const transitionsToLabel = (transitions: Set<string>): string => {
    return Array.from(transitions).join(",");
}

export const getStateColor = (isAdmit: boolean, isInitial: boolean): object => {
    const getColorObject = (background: string): object => {
        return {
            background: background
        }
    }

    if (isAdmit) {
        return getColorObject("#88ff88");
    }

    return getColorObject("#fff");
}