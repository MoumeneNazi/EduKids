import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import ProtectedRoute from './components/shared/ProtectedRoute.jsx'
import Sidebar from './components/shared/Sidebar.jsx'
import Navbar from './components/shared/Navbar.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/auth/Login.jsx'
import SignUp from './pages/auth/SignUp.jsx'
import StudentDashboard from './pages/student/StudentDashboard.jsx'
import MyCourses from './pages/student/MyCourses.jsx'
import TakeQuiz from './pages/student/TakeQuiz.jsx'
import MyGrades from './pages/student/MyGrades.jsx'
import Homework from './pages/student/Homework.jsx'
import Achievements from './pages/student/Achievements.jsx'
import StudyRoom from './pages/student/StudyRoom.jsx'
import ParentDashboard from './pages/parent/ParentDashboard.jsx'
import ChildProgress from './pages/parent/ChildProgress.jsx'
import ParentAttendance from './pages/parent/Attendance.jsx'
import ParentMessages from './pages/parent/Messages.jsx'
import ReportCard from './pages/parent/ReportCard.jsx'
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx'
import ManageCourses from './pages/teacher/ManageCourses.jsx'
import CreateTest from './pages/teacher/CreateTest.jsx'
import GradeBook from './pages/teacher/GradeBook.jsx'
import TeacherAttendance from './pages/teacher/Attendance.jsx'
import MessageParents from './pages/teacher/MessageParents.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import ManageUsers from './pages/admin/ManageUsers.jsx'
import Timetable from './pages/admin/Timetable.jsx'
import Announcements from './pages/admin/Announcements.jsx'

function RoleLayout({ title, variant }) {
  const bgMap = {
    student: 'bg-edukids-student-bg',
    parent: 'bg-edukids-parent-bg',
    teacher: 'bg-edukids-teacher-bg',
    admin: 'bg-slate-950',
  }

  const backgroundClass = bgMap[variant] ?? 'bg-slate-50'

  return (
    <div className={`flex min-h-screen ${backgroundClass}`}>
      <div className="hidden w-56 md:block">
        <Sidebar />
      </div>
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-3xl bg-white/90 p-4 shadow-sm shadow-slate-200 backdrop-blur-md md:p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      <Route element={<ProtectedRoute role="student" />}>
        <Route path="/student" element={<RoleLayout title="Student Portal" variant="student" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="quiz" element={<TakeQuiz />} />
          <Route path="grades" element={<MyGrades />} />
          <Route path="homework" element={<Homework />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="study-room" element={<StudyRoom />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="parent" />}>
        <Route path="/parent" element={<RoleLayout title="Parent Portal" variant="parent" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="child-progress" element={<ChildProgress />} />
          <Route path="attendance" element={<ParentAttendance />} />
          <Route path="messages" element={<ParentMessages />} />
          <Route path="report-card" element={<ReportCard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="teacher" />}>
        <Route path="/teacher" element={<RoleLayout title="Teacher Portal" variant="teacher" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="courses" element={<ManageCourses />} />
          <Route path="create-test" element={<CreateTest />} />
          <Route path="gradebook" element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="gradebook/:courseId" element={<GradeBook />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="message-parents" element={<MessageParents />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<RoleLayout title="Admin Portal" variant="admin" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="announcements" element={<Announcements />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
