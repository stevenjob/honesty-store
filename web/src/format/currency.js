export const format = (amount) => (amount / 100).toFixed(2);

export default (value) => {
    if (value == null) {
        throw new Error(`Null/undefined amount`);
    }
    if (typeof value === 'number') {
        return format(value);
    }
    throw new Error(`Parsing not supported`);
};