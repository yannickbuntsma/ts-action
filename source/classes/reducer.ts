/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/ts-action
 */

import { Action } from "../common/types";
import { ActionCtor, Ctor } from "./action";

export type On<S> = (state: S, action: Action<string>) => S;
export type Reducer<S> = (state: S | undefined, action: Action<string>) => S;

export function on<C extends ActionCtor<string, {}, Ctor<{}>>, S>(ctor: C, reducer: (state: S, action: InstanceType<C>) => S): { reducer: On<S>, types: string[] };
export function on<C extends { [key: string]: ActionCtor<string, {}, Ctor<{}>> }, S>(ctors: C, reducer: (state: S, action: InstanceType<C[keyof C]>) => S): { reducer: On<S>, types: string[] };
export function on<S>(c: ActionCtor<string, {}, Ctor<{}>> | { [key: string]: ActionCtor<string, {}, Ctor<{}>> }, reducer: On<S>): { reducer: On<S>, types: string[] } {
    const types = typeof c === "function" ?
        [c.type] :
        Object.keys(c).reduce((t, k) => [...t, c[k].type], [] as string[]);
    return { reducer, types };
}

export function reducer<S>(ons: { reducer: On<S>, types: string[] }[], initialState: S): Reducer<S> {
    const map = new Map<string, On<S>>();
    ons.forEach(on => on.types.forEach(type => map.set(type, on.reducer)));
    return function (state: S = initialState, action: Action<string>): S {
        const reducer = map.get(action.type);
        return reducer ? reducer(state, action) : state;
    };
}
