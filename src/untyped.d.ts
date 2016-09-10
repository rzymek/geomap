
declare module "lodash" {
    interface LoDashStatic {
        defaultTo1<T,V>(value: T, defaultTo: V): T|V
    }
    interface LoDashExplicitArrayWrapper<T> {
        head<T>(): T;
    }
}