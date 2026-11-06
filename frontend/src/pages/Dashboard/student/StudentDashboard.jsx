import React from 'react'
import LogoutButton from '../../../components/login/LogoutButton';

const StudentDashboard = () => {
  return (
    <div>StudentDashboard
        <div className="mt-auto pt-6 border-t border-indigo-600">
          <LogoutButton open={open} />
        </div>
    </div>
  )
}

export default StudentDashboard;