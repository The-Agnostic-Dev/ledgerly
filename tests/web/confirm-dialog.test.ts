import { describe, it, expect, vi } from 'vitest';
import { Children, isValidElement, type ReactNode } from 'react';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';

type ButtonProps = {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
};

type ButtonNode = { props: ButtonProps };

function findButtonByClass(node: unknown, className: string): ButtonNode | null {
  if (!isValidElement(node)) return null;
  const props = node.props as ButtonProps;
  if (props.className === className) return { props };
  const children = props.children;
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

    dangerButton!.props.onClick!();
    expect(onConfirm).toHaveBeenCalledTimes(1);

    const cancelButton = findButtonByClass(tree, 'button secondary');
    expect(cancelButton).not.toBeNull();
    cancelButton!.props.onClick!();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
