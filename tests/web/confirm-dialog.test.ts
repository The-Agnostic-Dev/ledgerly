import { describe, it, expect, vi } from 'vitest';
import { Children, isValidElement } from 'react';
import type { ReactElement } from 'react';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';

function findButtonByClass(node: unknown, className: string): ReactElement | null {
  if (!isValidElement(node)) return null;
  if (node.props.className === className) return node;
  const children = node.props.children;
  if (children == null) return null;
  const childrenArray = Children.toArray(children);
  for (const child of childrenArray) {
    const found = findButtonByClass(child, className);
    if (found) return found;
  }
  return null;
}

describe('ConfirmDialog', () => {
  it('calls onConfirm when the danger button is clicked', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const tree = ConfirmDialog({
      title: 'Delete expense?',
      message: 'Are you sure?',
      onConfirm,
      onCancel,
    });

    const dangerButton = findButtonByClass(tree, 'button danger');
    expect(dangerButton).not.toBeNull();
    expect(dangerButton!.props.disabled).toBeFalsy();

    dangerButton!.props.onClick();
    expect(onConfirm).toHaveBeenCalledTimes(1);

    const cancelButton = findButtonByClass(tree, 'button secondary');
    expect(cancelButton).not.toBeNull();
    cancelButton!.props.onClick();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
