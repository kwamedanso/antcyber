// utils/useItemAllowed.util.js
import usePermissions from './usePermissions';

/**
 * Given an item's permission fields, return whether the current user can see it.
 *
 * Rules (checked in order):
 *   public === true                    → always visible
 *   resource + action                  → single check
 *   any: [[r,a], ...]                  → at least one
 *   all: [[r,a], ...]                  → every one
 *   container (has children, no `to`)  → visible if any child is visible (caller decides)
 *   leaf with no rule                  → hidden (fail-closed)
 */
export const useItemAllowed = (item) => {
  const { has, hasAny, hasAll } = usePermissions();

  if (item.public === true) return true;

  if (item.resource && item.action) {
    return has(item.resource, item.action);
  }

  if (Array.isArray(item.any) && item.any.length > 0) {
    return hasAny(item.any);
  }

  if (Array.isArray(item.all) && item.all.length > 0) {
    return hasAll(item.all);
  }

  // No explicit rule. Container items default to visible — their children
  // will be filtered separately, and empty containers get pruned by the
  // caller. Leaves default to hidden.
  const isContainer = Array.isArray(item.children) && item.children.length > 0 && !item.to;
  return isContainer;
};

/**
 * Recursively filter a list of items. Removes items the user can't see,
 * and prunes containers whose children are all hidden.
 *
 * Returns the filtered array.
 */
export const filterItems = (items, perms) => {
  const { has, hasAny, hasAll } = perms;

  const checkOne = (item) => {
    // Own permission
    let allowed = false;

    if (item.public === true) allowed = true;
    else if (item.resource && item.action) allowed = has(item.resource, item.action);
    else if (Array.isArray(item.any) && item.any.length) allowed = hasAny(item.any);
    else if (Array.isArray(item.all) && item.all.length) allowed = hasAll(item.all);
    else if (Array.isArray(item.children) && item.children.length && !item.to) allowed = true;
    // else stays false (leaf with no rule = hidden)

    if (!allowed) return null;

    if (Array.isArray(item.children) && item.children.length > 0) {
      const filteredChildren = item.children.map(checkOne).filter(Boolean);
      // Container became empty → hide the parent too.
      if (filteredChildren.length === 0) return null;
      return { ...item, children: filteredChildren };
    }

    return item;
  };

  return items.map(checkOne).filter(Boolean);
};