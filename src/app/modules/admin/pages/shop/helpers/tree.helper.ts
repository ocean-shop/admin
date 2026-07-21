import { TreeNode } from '../models/tree-node.model';

type TreeBuilderConfig<T> = {
  getId: (value: T) => string;
  getParentId: (value: T) => string | undefined;
  compareSiblings?: (left: T, right: T) => number;
};

export function buildTree<T>(values: T[], config: TreeBuilderConfig<T>): TreeNode<T>[] {
  const nodeMap = new Map<string, TreeNode<T>>();

  for (const value of values) {
    const id = config.getId(value).trim();
    if (!id || nodeMap.has(id)) {
      continue;
    }

    nodeMap.set(id, { value, children: [] });
  }

  const roots: TreeNode<T>[] = [];

  for (const [id, node] of nodeMap.entries()) {
    const parentId = config.getParentId(node.value)?.trim();
    if (!parentId || parentId === id) {
      roots.push(node);
      continue;
    }

    const parentNode = nodeMap.get(parentId);
    if (!parentNode || hasCycle(nodeMap, config.getParentId, id, parentId)) {
      roots.push(node);
      continue;
    }

    parentNode.children.push(node);
  }

  if (config.compareSiblings) {
    sortTreeRecursively(roots, config.compareSiblings);
  }

  return roots;
}

export function flattenTree<T, TResult>(
  roots: TreeNode<T>[],
  getId: (value: T) => string,
  mapValue: (value: T, level: number) => TResult,
): TResult[] {
  const flattened: TResult[] = [];
  const visited = new Set<string>();

  for (const node of roots) {
    appendFlattenedNode(node, 0, flattened, visited, getId, mapValue);
  }

  return flattened;
}

function hasCycle<T>(
  nodeMap: Map<string, TreeNode<T>>,
  getParentId: (value: T) => string | undefined,
  nodeId: string,
  parentId: string,
): boolean {
  let currentParentId: string | undefined = parentId;
  const checked = new Set<string>();

  while (currentParentId) {
    if (currentParentId === nodeId || checked.has(currentParentId)) {
      return true;
    }

    checked.add(currentParentId);
    const parentNode = nodeMap.get(currentParentId);
    currentParentId = parentNode ? getParentId(parentNode.value)?.trim() : undefined;
  }

  return false;
}

function sortTreeRecursively<T>(
  nodes: TreeNode<T>[],
  compareSiblings: (left: T, right: T) => number,
): void {
  nodes.sort((left, right) => compareSiblings(left.value, right.value));

  for (const node of nodes) {
    sortTreeRecursively(node.children, compareSiblings);
  }
}

function appendFlattenedNode<T, TResult>(
  node: TreeNode<T>,
  level: number,
  flattened: TResult[],
  visited: Set<string>,
  getId: (value: T) => string,
  mapValue: (value: T, level: number) => TResult,
): void {
  const nodeId = getId(node.value).trim();
  if (!nodeId || visited.has(nodeId)) {
    return;
  }

  visited.add(nodeId);
  flattened.push(mapValue(node.value, level));

  for (const childNode of node.children) {
    appendFlattenedNode(childNode, level + 1, flattened, visited, getId, mapValue);
  }
}
