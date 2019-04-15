import { mergeDeep } from "../src/utils/deepMerge";

test("merge with different keys", () => {

    const merged = mergeDeep({a: "a"}, {b: {c: "c"}});
    expect(merged).toEqual({
        a: "a",
        b: {
            c: "c"
        }
    });

})
