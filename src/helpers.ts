function hasProperty<K extends string>(x: unknown, name: K): x is { [M in K]: unknown } {
    return x instanceof Object && name in x;
}

export {hasProperty};