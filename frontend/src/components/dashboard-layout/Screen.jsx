// components/Screen.jsx
import PropTypes from 'prop-types';
import { useScreenSize, isSizeInRange } from '../../hooks/useScreenSize';

/**
 * <Screen from="md" to="xl">...</Screen>
 *   → renders when size is md, lg, or xl
 *
 * <Screen from="lg">...</Screen>
 *   → renders when size is lg or larger
 *
 * <Screen to="sm">...</Screen>
 *   → renders when size is xs or sm
 *
 * <Screen from="lg" fallback={<MobileView />}>...</Screen>
 *   → renders children in-range, fallback out-of-range
 */
export function Screen({ from, to, fallback = null, children }) {
  const { size } = useScreenSize();
  const inRange = isSizeInRange(size, from, to);
  return inRange ? children : fallback;
}

Screen.propTypes = {
  from: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  to: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  fallback: PropTypes.node,
  children: PropTypes.node,
};