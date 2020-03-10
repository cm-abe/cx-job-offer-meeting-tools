function hasProperty<K extends string>(x: unknown, name: K): x is { [M in K]: unknown } {
    return x instanceof Object && name in x;
}

function getMentionsUser(text: string): RegExpMatchArray {
    const regIdPattern = /<@[A-Z0-9]{9}>/g;

    return text.match(regIdPattern);
}

export {hasProperty, getMentionsUser};