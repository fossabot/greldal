import { uniqueId } from "lodash";
import { negate, isString, isNil } from "lodash";
import { property } from "lodash";
import { Dict, Maybe } from "./util-types";

export const indexBy = <T>(arr: T[], path: string) => {
    const prop = property<T, string>(path);
    return arr.reduce((result: Dict<T>, item) => {
        result[prop(item)] = item;
        return result;
    }, {}) as Dict<T>;
};

export function interceptThrough<T>(val: T, interceptor: Maybe<(v: T) => Maybe<T>>) {
    if (isNil(interceptor)) return val;
    const intercepted = interceptor(val);
    if (isNil(intercepted)) return val;
    return intercepted;
}

export function MemoizeGetter(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const { get } = descriptor;
    if (!get) {
        throw new Error("MemoizeGetter can only be applied to a getter");
    }
    descriptor.get = function() {
        const value = get.apply(this);
        Object.defineProperty(this, propertyKey, { value });
        return value;
    };
}
