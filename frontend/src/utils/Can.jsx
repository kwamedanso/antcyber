// components/auth/Can.jsx
import React from 'react';
import usePermissions from '../hooks/usePermissions';

/**
 * A wrapper component that conditionally renders its children based on user permissions.
 * 
 * Usage:
 * 
 * 1. Single permission check:
 * <Can resource="reports" action="create">
 *   <button>Create Report</button>
 * </Can>
 * 
 * 2. Require ALL of the given permissions:
 * <Can all={[['reports', 'update'], ['reports', 'submit']]}>
 *   <button>Update & Submit</button>
 * </Can>
 * 
 * 3. Require ANY of the given permissions (OR logic):
 * <Can any={[['reports', 'delete'], ['reports', 'receive']]}>
 *   <button>Manage Report</button>
 * </Can>
 * 
 * 4. Using a fallback:
 * <Can resource="reports" action="delete" fallback={<p>You do not have access.</p>}>
 *   <button>Delete</button>
 * </Can>
 */
const Can = ({ 
  resource, 
  action, 
  all = [], 
  any = [], 
  children, 
  fallback = null 
}) => {
  const { has, hasAll, hasAny } = usePermissions();

  let isAllowed = false;

  // If a single resource/action pair is provided
  if (resource && action) {
    isAllowed = has(resource, action);
  } 
  // If an array of pairs is provided for "ALL"
  else if (all && all.length > 0) {
    isAllowed = hasAll(all);
  } 
  // If an array of pairs is provided for "ANY"
  else if (any && any.length > 0) {
    isAllowed = hasAny(any);
  }

  if (!isAllowed) {
    return fallback;
  }

  return <>{children}</>;
};

export default Can;