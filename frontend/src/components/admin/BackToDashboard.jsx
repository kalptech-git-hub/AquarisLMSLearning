import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BackToDashboard = ({ title, subtitle }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div
        onClick={() => navigate("/admin/dashboard")}
        className="flex items-center gap-2 text-violet-600 cursor-pointer hover:underline mb-4"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </div>

      <h1 className="text-3xl font-bold">{title}</h1>

      {subtitle && (
        <p className="text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default BackToDashboard;