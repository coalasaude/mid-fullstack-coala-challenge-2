import type { MessageTree } from './messages';

type Join<K extends string, P extends string> = `${K}.${P}`;

type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? Prefix extends ''
      ? `${K}`
      : Join<Prefix, `${K}`>
    : T[K] extends Record<string, unknown>
      ? Leaves<T[K], Prefix extends '' ? `${K}` : Join<Prefix, `${K}`>>
      : never;
}[keyof T & string];

export type MessagePath = Leaves<MessageTree>;
