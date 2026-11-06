import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item?",
  confirmText = "Delete",
  confirmVariant = "danger",
  cancelText = "Cancel"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md z-[1001] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start p-6">
          <div
  className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
    confirmVariant === "success" ? "bg-green-100" : "bg-red-100"
  }`}
>
  <FiAlertTriangle
    className={`h-6 w-6 ${
      confirmVariant === "success" ? "text-green-600" : "text-red-600"
    }`}
  />
</div>
          <div className="ml-4 pr-6">
            <h3 className="text-lg font-medium text-gray-900">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white transition cursor-pointer shadow-sm ${
  confirmVariant === "success"
    ? "bg-green-600 hover:bg-green-700"
    : "bg-red-600 hover:bg-red-700"
}`}>
            {confirmText}
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 focus:outline-none transition cursor-pointer"
        >
          <FiX className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;
