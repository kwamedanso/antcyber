import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { WORKSPACES } from './constants';

const WorkspaceSwitcher = ({ isOpen }) => {
  if (!isOpen) return null;
  return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-0 left-full ml-4 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-[100]"
      >
      {WORKSPACES.map((ws) => (
        <button key={ws.id} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all group relative">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white bg-indigo-600`}>
            {ws.icon}
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold text-gray-900">{ws.name}</p>
            <p className="text-xs text-gray-500">{ws.type} • {ws.members} members</p>
          </div>
          {ws.active && <FiCheck className="text-indigo-600" />}
        </button>
      ))}
      </motion.div>
  );
};

export default WorkspaceSwitcher;