const AdminCourses = () => {
    return <h1>Courses</h1>
};
export default AdminCourses;


// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FiDelete, FiEdit, FiTrash2 } from "react-icons/fi";

// const AdminCourses = () => {

//     const [courses, setCourses] = useState([]);

//     // const location = useLocation();

//     const getCourses = async () => {

//         try {

//             const token = sessionStorage.getItem("token");

//             const response = await axios.get(
//                 `${import.meta.env.VITE_API_BASE_URL}/api/courses`,

//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`
//                     }
//                 }

//             );

//             if (response.data.success) {

//                 setCourses(response.data.courses);

//             }

//         } catch (error) {

//             console.log(error);

//         }

//     };

//     useEffect(() => {

//         getCourses();

//     }, []);

//     return (
//         <section className="">

//             <div className="mb-8">

//                 <h1 className="text-4xl font-black text-gray-900">
//                     Courses
//                 </h1>

//                 <p className="text-gray-500 mt-2">
//                     Manage all courses available in the LMS.
//                 </p>

//             </div>

//             <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

//                 <div className="overflow-x-auto">

//                     <table className="w-full">

//                         <thead>

//                             <tr className="bg-red-600 text-white">

//                                 <th className="px-5 py-4 text-left">
//                                     Sr.
//                                 </th>

//                                 {/* <th className="px-5 py-4 text-left">
//                                     Thumbnail
//                                 </th> */}

//                                 <th className="px-5 py-4 text-left">
//                                     Title
//                                 </th>

//                                 <th className="px-5 py-4 text-left">
//                                     Instructor
//                                 </th>

//                                 <th className="px-5 py-4 text-left">
//                                     Level
//                                 </th>

//                                 <th className="px-5 py-4 text-left">
//                                     Duration
//                                 </th>

//                                 <th className="px-5 py-4 text-left">
//                                     Price
//                                 </th>

//                                 <th className="px-5 py-4 text-center">
//                                     Actions
//                                 </th>

//                             </tr>

//                         </thead>

//                         <tbody>

//                             {
//                                 courses.map((course, index) => (

//                                     <tr
//                                         key={course.cm_id}
//                                         className="border-b border-red-50 hover:bg-gray-50 transition"
//                                     >

//                                         <td className="px-5 py-4">
//                                             {index + 1}
//                                         </td>

//                                         {/* <td className="px-5 py-4">

//                                             <img
//                                                 src={`${import.meta.env.VITE_API_BASE_URL}${course.cm_thumbnail}`}
//                                                 alt={course.cm_title}
//                                                 className="w-20 h-14 rounded-lg object-cover border"
//                                             />

//                                         </td> */}

//                                         <td className="px-5 py-4">
//                                             {course.cm_title}
//                                         </td>

//                                         <td className="px-5 py-4">
//                                             {course.cm_instructor_name}
//                                         </td>

//                                         <td className="px-5 py-4">

//                                             <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">

//                                                 {course.cm_level}

//                                             </span>

//                                         </td>

//                                         <td className="px-5 py-4">
//                                             {course.cm_duration}
//                                         </td>

//                                         <td className="px-5 py-4">
//                                             ₹{course.cm_price}
//                                         </td>

//                                         <td className="px-5 py-4">

//                                             <div className="flex justify-center gap-4">

//                                                 <button
//                                                     className="hover:text-indigo-600 text-indigo-500 rounded-lg text-[17px] cursor-pointer"
//                                                 >
//                                                     <FiEdit />
//                                                 </button>

//                                                 <button
//                                                     className="text-red-600 hover:text-red-700 rounded-lg text-[17px] cursor-pointer"
//                                                 >
//                                                     <FiTrash2 />
                                                
//                                                 </button>

//                                             </div>

//                                         </td>

//                                     </tr>

//                                 ))
//                             }

//                         </tbody>

//                     </table>

//                 </div>

//             </div>

//         </section>

//     );
// };

// export default AdminCourses;