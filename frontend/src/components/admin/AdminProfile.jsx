// AdminProfile.jsx
import { useState } from "react";
import {
  UserCircle,
  Mail,
  Phone,
  Shield,
  Activity,
  Pencil,
} from "lucide-react";
import { getCurrentUser, getLastLogin } from "../../utils/auth";
import ProfileEditModal from "../profile/ProfileEditModal";

const AdminProfile = () => {
  const user = getCurrentUser();
  const lastLogin = getLastLogin();
  const [isEditing, setIsEditing] = useState(false);


  return (
    <div className="min-h-screen bg-gray-100">

      {/* Cover Banner */}
      <div className="h-42 bg-gradient-to-r from-[#1E2A4A] via-[#7B3B5C] to-[#da3232] relative rounded-b-3xl shadow-lg">

        {/* Avatar */}
        <div className="absolute left-12 -bottom-16">
          <div className="w-36 h-36 rounded-full bg-white shadow-xl ring-4 ring-white overflow-hidden">
            {user?.user_profile_photo ? (
              <img
                src={/^https?:\/\//i.test(user.user_profile_photo)
                  ? user.user_profile_photo
                  : `${import.meta.env.VITE_API_BASE_URL}${user.user_profile_photo}`}
                alt={user.user_full_name || user.username || "Admin"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <UserCircle className="w-28 h-28 text-gray-500" />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 pt-24 pb-10">

        {/* Name + Button */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center">

          <div>
            <h1 className="text-3xl font-bold text-[#1E2A4A]">
              {user?.user_full_name || user?.username || "Admin"}
            </h1>

            <p className="text-gray-500 mt-1">
              Administrator
            </p>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-5 lg:mt-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#1E2A4A] via-[#7B3B5C] to-[#da3232] text-white
              shadow-lg hover:scale-105 transition cursor-pointer"
          >
            <Pencil size={18} />
            Edit Profile
          </button>

        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-3 gap-8 mt-10">

          {/* ================= LEFT SIDEBAR ================= */}

          <div className="space-y-6">



            {/* Contact */}
            <div className="bg-white rounded-3xl shadow-md p-6">

              <h2 className="text-lg font-bold text-[#1E2A4A] mb-5">
                Contact
              </h2>

              <div className="space-y-5">

                <div className="flex gap-3">
                  <Mail className="text-red-500 mt-1" />

                  <div>
                    <p className="text-sm text-gray-500">
                      Email
                    </p>

                    <p className="font-semibold break-all">
                      {user?.user_email || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone className="text-red-500 mt-1" />

                  <div>
                    <p className="text-sm text-gray-500">
                      Mobile
                    </p>

                    <p className="font-semibold">
                      {user?.user_mobile_no || "-"}
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* ================= RIGHT SIDE ================= */}

          <div className="lg:col-span-2 space-y-6">

            {/* Account Information */}

            <div className="bg-white rounded-3xl shadow-md p-8">

              <h2 className="text-2xl font-bold text-[#1E2A4A] mb-8">
                Account Information
              </h2>



              <div className="grid md:grid-cols-2 gap-8">

                <div>
                  <p className="text-gray-500 text-sm">
                    Full Name
                  </p>

                  <p className="font-semibold text-lg mt-1">
                    {user?.user_full_name || "-"}
                  </p>
                </div>


                {/* was: <div className="flex items-start gap-3"> */}
                <div className="sm:flex sm:items-start sm:gap-3">
                  {/* was: <Shield className="text-red-500 mt-1" /> */}
                  <Shield className="hidden sm:block text-red-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-semibold">
                      Administrator
                    </p>
                  </div>
                </div>



                <div>
                  <p className="text-gray-500 text-sm">
                    Username
                  </p>

                  <p className="font-semibold text-lg mt-1">
                    {user?.username || "-"}
                  </p>
                </div>

                {/* was: <div className="flex items-start gap-3"> */}
                <div className="sm:flex sm:items-start sm:gap-3">
                  {/* was: <Activity className="text-red-500 mt-1" /> */}
                  <Activity className="hidden sm:block text-red-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">
                      Status
                    </p>
                    <span className="inline-flex items-center justify-center bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium mt-1">
                      Active
                    </span>
                  </div>
                </div>


                <div>
                  <p className="text-gray-500 text-sm">
                    Last Login
                  </p>

                  <h2 className="text-lg font-semibold text-[#1E2A4A] mt-2">
                    {lastLogin || "Unknown"}
                  </h2>
                </div>

              </div>

            </div>



          </div>

        </div>

      </div>

      <ProfileEditModal
        user={user}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSaved={() => window.location.reload()}
      />
    </div>
  );
};

export default AdminProfile;