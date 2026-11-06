import React from "react";
import { FiLogOut, FiX } from "react-icons/fi";

const LogoutModal = ({ onClose, onLogout }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-sm"
        // onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md z-[1001]">
        {/* Modal Header */}
        <div className="flex items-start p-6">
          <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <FiLogOut className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              Logout Confirmation
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to logout?
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-gradient-to-r from-blue-900 to-blue-950 rounded-md text-sm font-medium text-white hover:bg-slate-900"
          >
            Logout
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
        >
          <FiX className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default LogoutModal;
