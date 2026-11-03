// utils/iconMap.util.js
import {
  FiInbox, FiUsers, FiUserPlus, FiShield,
  FiBriefcase, FiFileText, FiClipboard,
  FiAward, FiCheckSquare, FiAlertCircle, FiCalendar,
  FiGrid, FiLayers, FiDollarSign, FiMapPin,
  FiTool, FiGlobe, FiCreditCard, FiHome, FiSettings
} from 'react-icons/fi';

import { FaTasks,FaProjectDiagram  } from 'react-icons/fa';
import { HiOutlineDocumentReport } from "react-icons/hi";
import { CgNotes } from "react-icons/cg";

const ICON_MAP = {
  dashboard:  FiInbox,
  users:      FiUsers,
  user_plus:  FiUserPlus,
  shield:     FiShield,
  briefcase:  FiBriefcase,
  file:       FiFileText,
  clipboard:  FiClipboard,
  award:      FiAward,
  check:      FiCheckSquare,
  alert:      FiAlertCircle,
  calendar:   FiCalendar,
  grid:       FiGrid,
  layers:     FiLayers,
  banknote:   FiCreditCard,
  location:   FiMapPin,
  tool:       FiTool,
  globe:      FiGlobe,
  building:   FiHome,
  settings:   FiSettings,
  tasks:      FaTasks,
  project_diagram: FaProjectDiagram,
  report: CgNotes
};

/**
 * Accepts either a string key ("users") or a component (FiUsers).
 * Returns a component or null.
 */
export const resolveIcon = (icon) => {
  if (!icon) return null;
  if (typeof icon === 'string') return ICON_MAP[icon] || null;
  return icon;   // already a component
};