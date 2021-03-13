export const transitionsToLabel = (transitions: Set<string>): string => {
    return Array.from(transitions).join(",");
}