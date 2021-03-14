export const transitionsToLabel = (transitions: Set<string>): string => {
    return Array.from(transitions).join(",");
}

export const getStateColor = (isAdmit: boolean, isInitial: boolean, isCurrent: boolean): object => {
    const getColorObject = (background: string): object => {
        return {
            background: background,
            border: isCurrent ? "#ff0000" : "#000"
        }
    }

    if (isAdmit) {
        return getColorObject("#88ff88");
    }

    if (isInitial) {
        return getColorObject("#ffff88");
    }

    return getColorObject("#fff");
}