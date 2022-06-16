/*
* timing.ts
*
* Copyright (C) 2022 by RStudio, PBC
*
*/

interface TimingNode {
  name: string;
  start: number;
  end: number;
  children: TimingNode[];
}

const nodeStack: TimingNode[] = [{
  name: "global",
  children: [{
    name: "deno-init",
    start: 0,
    end: performance.now(),
    children: [],
  }],
  start: 0,
  end: 0,
}];

export function withTiming<T>(
  name: string,
  fun: () => T,
): T {
  push(name);
  try {
    const result = fun();
    return result;
  } finally {
    pop();
  }
}

export async function withTimingAsync<T>(
  name: string,
  fun: () => T | Promise<T>,
): Promise<T> {
  push(name);
  try {
    const result = await fun();
    pop();
    return result;
  } catch (e) {
    pop();
    throw e;
  }
}

export function init() {
  nodeStack[0].start = performance.now();
}

export function push(name: string) {
  nodeStack.push({
    name,
    start: performance.now(),
    end: 0,
    children: [],
  });
}

export function pop() {
  if (nodeStack.length <= 1) {
    throw new Error("Can't pop top node");
  }
  const node = nodeStack.pop()!;
  node.end = performance.now();
  nodeStack[nodeStack.length - 1].children.push(node);
}

export function getData() {
  nodeStack[0].end = performance.now();
  return nodeStack[0];
}
