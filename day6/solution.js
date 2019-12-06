const input = `COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L`.split("\n").map((rel => {
    const [from, to] = rel.split(")")
    return { from, to };
}));

console.log(input);