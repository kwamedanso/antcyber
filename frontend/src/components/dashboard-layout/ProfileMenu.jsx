import React from 'react';
import { motion } from 'framer-motion';
import { FiFolder, FiClock, FiStar, FiLogOut } from 'react-icons/fi';

const ProfileMenu = ({ isOpen, direction = "up" }) => {
  if (!isOpen) return null;
  return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: direction === 'up' ? 10 : -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: direction === 'up' ? 10 : -10 }}
        className={`absolute ${direction === 'up' ? 'bottom-full mb-2 left-0' : 'top-full mt-2 right-0'} w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100]`}
      >
        <div className="p-4 border-b border-gray-50 flex items-center gap-3">
          <img src="https://i.pravatar.cc/150?u=sandra" className="w-10 h-10 rounded-lg object-cover" alt="Avatar" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Sandra Marx</p>
            <p className="text-xs text-gray-500">sandra@gmail.com</p>
          </div>
        </div>
        <div className="p-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <FiFolder size={16} /> Integrations
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <FiClock size={16} /> History
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
            <FiStar size={16} /> Upgrade to Pro
          </button>
        </div>
        <div className="p-2 border-t border-gray-50">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Update App
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors mt-1">
            <FiLogOut size={16} /> Logout
          </button>
        </div>
        <div className="p-3 bg-gray-50 flex justify-between items-center text-[10px] text-gray-400">
          <span>v1.5.69</span>
          <span>Terms & Conditions</span>
        </div>
      </motion.div>
  );
};

export default ProfileMenu;