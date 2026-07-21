import { buildTree, flattenTree } from './tree.helper';

type OptionNode = {
  label: string;
  value: string;
  parentId?: string;
};

describe('tree.helper', () => {
  it('builds and flattens hierarchical options with levels', () => {
    const options: OptionNode[] = [
      { label: 'Root B', value: 'b' },
      { label: 'Child A2', value: 'a-2', parentId: 'a' },
      { label: 'Root A', value: 'a' },
      { label: 'Child A1', value: 'a-1', parentId: 'a' },
    ];

    const tree = buildTree(options, {
      getId: (option) => option.value,
      getParentId: (option) => option.parentId,
      compareSiblings: (left, right) => left.label.localeCompare(right.label),
    });

    const flattened = flattenTree(
      tree,
      (option) => option.value,
      (option, level) => `${level}:${option.value}`,
    );

    expect(flattened).toEqual(['0:a', '1:a-1', '1:a-2', '0:b']);
  });

  it('keeps cyclic or missing-parent nodes reachable as roots', () => {
    const options: OptionNode[] = [
      { label: 'Cycle One', value: '1', parentId: '2' },
      { label: 'Cycle Two', value: '2', parentId: '1' },
      { label: 'Missing Parent', value: '3', parentId: 'missing' },
    ];

    const tree = buildTree(options, {
      getId: (option) => option.value,
      getParentId: (option) => option.parentId,
      compareSiblings: (left, right) => left.value.localeCompare(right.value),
    });

    const flattened = flattenTree(
      tree,
      (option) => option.value,
      (option) => option.value,
    );

    expect(flattened).toEqual(['1', '2', '3']);
  });
});
