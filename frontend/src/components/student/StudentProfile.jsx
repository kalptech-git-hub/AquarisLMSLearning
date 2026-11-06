// StudentProfile.jsx
import { useState } from "react";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Calendar,
  Pencil,
} from "lucide-react";
import { getCurrentUser, getLastLogin } from "../../utils/auth";
import ProfileEditModal from "../profile/ProfileEditModal";
import Navbar from "../lander/Navbar";


const StudentProfile = () => {
  const user = getCurrentUser();
  const lastLogin = getLastLogin();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <Navbar />
      <div className="min-h-screen shrink-0 bg-gray-100 px-4 pb-32 pt-24 sm:px-6 sm:pb-20">
      <div className="mx-auto w-full max-w-7xl">

        <ProfileEditModal
          user={user}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSaved={() => window.location.reload()}
        />

        {/* Cover Banner */}
        <div className="h-42 bg-gradient-to-r from-[#1E2A4A] via-[#7B3B5C] to-[#da3232] relative rounded-3xl shadow-lg">


          {/* Avatar */}
          <div className="absolute left-6 -bottom-16 sm:left-8">
            <div className="w-36 h-36 rounded-full bg-white shadow-xl ring-4 ring-white overflow-hidden">
              {user?.user_profile_photo ? (
                <img
                  src={/^https?:\/\//i.test(user.user_profile_photo)
                    ? user.user_profile_photo
                    : `${import.meta.env.VITE_API_BASE_URL}${user.user_profile_photo}`}
                  alt={user.user_full_name || user.username || "User"}
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
        {/* was: pb-10 unconditionally — on phone, the last card ("Last Login") sat too
            close to the bottom edge with barely any room to scroll it fully into view
            past the browser's UI chrome. pb-32 on phone gives real scroll room below
            it; sm: reverts to the original pb-10, so desktop/tablet is unchanged. */}
        <div className="px-6 pt-20 sm:px-8">

          {/* Name + Button */}
          <div className="flex flex-col lg:flex-row justify-between lg:items-center">

            <div>
              <h1 className="text-3xl font-bold text-[#1E2A4A]">
                {user?.user_full_name || "Student"}
              </h1>

              <p className="text-gray-500 mt-1">
                Japanese Language Learner
              </p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="mt-5 lg:mt-0 flex items-center gap-2 px-6 py-3 rounded-xl
                bg-gradient-to-r from-[#1E2A4A] via-[#7B3B5C] to-[#da3232] text-white
                shadow-lg hover:scale-105 transition cursor-pointer
              "
            >
              <Pencil size={18} />
              Edit Profile
            </button>

          </div>

          {/* Main Layout */}
          <div className="grid lg:grid-cols-3 gap-8 mt-10">

            {/* ================= LEFT SIDEBAR ================= */}

            <div className="space-y-6">

              {/* About */}
              <div className="bg-white rounded-3xl shadow-md p-6">

                <h2 className="text-lg font-bold text-[#1E2A4A] mb-5">
                  About
                </h2>

                <div className="space-y-5">

                  <div className="flex items-start gap-3">
                    <BookOpen className="text-red-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-semibold">
                        Student
                      </p>
                    </div>
                  </div>



                  <div className="flex items-start gap-3">
                    <Calendar className="text-red-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Member Since
                      </p>
                      <p className="font-semibold">
                        {/* {user?.created_on
                          ? new Date(user.created_on).toISOString().slice(0, 10)
                          : "-"} */}
                        {user?.created_on
                          ? (() => {
                            const d = new Date(user.created_on);
                            const dd = String(d.getDate()).padStart(2, "0");
                            const mm = String(d.getMonth() + 1).padStart(2, "0");
                            const yyyy = d.getFullYear();
                            return `${dd} ${mm} ${yyyy}`;
                          })()
                          : "-"}
                      </p>
                    </div>
                  </div>

                </div>

              </div>

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

              {/* Personal Information */}

              <div className="bg-white rounded-3xl shadow-md p-8">

                <h2 className="text-2xl font-bold text-[#1E2A4A] mb-8">
                  Personal Information
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

                  <div>
                    <p className="text-gray-500 text-sm">
                      Username
                    </p>

                    <p className="font-semibold text-lg mt-1">
                      {user?.username || "-"}
                    </p>
                  </div>



                  <div>
                    <p className="text-gray-500 text-sm">
                      Postal Address
                    </p>

                    <p className="font-semibold text-lg mt-1">
                      {user?.address || "-"}
                    </p>
                  </div>

                </div>

              </div>

              {/* Statistics */}

              <div className="grid md:grid-cols-2 gap-6">

                <div className="bg-white rounded-3xl shadow-md p-6">

                  <p className="text-gray-500 text-sm">
                    Courses Enrolled
                  </p>

                  <h2 className="text-3xl font-bold text-[#1E2A4A] mt-2">
                    {user?.enrolled_count ?? "-"}
                  </h2>

                </div>

                <div className="bg-white rounded-3xl shadow-md p-6">

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
      </div>
    </>

  );
};

export default StudentProfile;