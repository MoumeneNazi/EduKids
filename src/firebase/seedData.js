import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  addDoc,
} from 'firebase/firestore'
import { auth, db } from './config'

// Seed database with demo data.
// Call seedDatabase() once in a development-only context (e.g. from a temporary button).
export async function seedDatabase() {
  // Simple guard: avoid accidental reseeding in production.
  if (import.meta.env.PROD) {
    throw new Error('seedDatabase() should only be run in development.')
  }

  // Sign out any existing session to avoid conflicts
  try {
    await auth.signOut()
  } catch {
    // ignore
  }

  const createdUsers = {}

  async function createUser(email, password, role, extraUserData = {}) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    const userDoc = {
      name: extraUserData.name ?? email.split('@')[0],
      email,
      role,
      avatar: extraUserData.avatar ?? '👤',
      createdAt: serverTimestamp(),
    }
    await setDoc(doc(db, 'users', user.uid), userDoc)
    createdUsers[email] = { uid: user.uid, role }
    return user
  }

  try {
    // Create core users
    const admin = await createUser('admin@edukids.com', 'admin123', 'admin', {
      name: 'School Admin',
      avatar: '🏫',
    })

    const teacher1 = await createUser(
      'teacher1@edukids.com',
      'teacher123',
      'teacher',
      { name: 'Mr. Martin', avatar: '👨‍🏫' },
    )
    const teacher2 = await createUser(
      'teacher2@edukids.com',
      'teacher123',
      'teacher',
      { name: 'Ms. Dupont', avatar: '👩‍🏫' },
    )

    const parent1 = await createUser(
      'parent1@edukids.com',
      'parent123',
      'parent',
      { name: 'Parent One', avatar: '👨‍👩‍👧' },
    )
    const parent2 = await createUser(
      'parent2@edukids.com',
      'parent123',
      'parent',
      { name: 'Parent Two', avatar: '👨‍👩‍👧' },
    )
    const parent3 = await createUser(
      'parent3@edukids.com',
      'parent123',
      'parent',
      { name: 'Parent Three', avatar: '👨‍👩‍👧' },
    )

    const student1 = await createUser(
      'student1@edukids.com',
      'student123',
      'student',
      { name: 'Ahmed', avatar: '🧒' },
    )
    const student2 = await createUser(
      'student2@edukids.com',
      'student123',
      'student',
      { name: 'Sara', avatar: '👧' },
    )
    const student3 = await createUser(
      'student3@edukids.com',
      'student123',
      'student',
      { name: 'Léa', avatar: '👧' },
    )
    const student4 = await createUser(
      'student4@edukids.com',
      'student123',
      'student',
      { name: 'Noah', avatar: '🧒' },
    )

    // Link students to parents/teachers
    const studentsCol = collection(db, 'students')
    const studentDocs = []

    async function addStudent(studentUser, parentUser, teacherUser, classLevel) {
      const ref = await addDoc(studentsCol, {
        uid: studentUser.uid,
        name: studentUser.displayName || studentUser.email.split('@')[0],
        parentId: parentUser.uid,
        teacherId: teacherUser.uid,
        classLevel,
        xpPoints: 240,
        badges: ['Early Bird', 'Math Star'],
      })
      studentDocs.push({ id: ref.id, uid: studentUser.uid, classLevel })
      return ref
    }

    await addStudent(student1, parent1, teacher1, 'CM1')
    await addStudent(student2, parent1, teacher1, 'CM1')
    await addStudent(student3, parent2, teacher2, 'CE2')
    await addStudent(student4, parent3, teacher2, 'CE2')

    // Courses
    const coursesCol = collection(db, 'courses')
    const mathCourseRef = await addDoc(coursesCol, {
      title: 'Fun Maths',
      subject: 'Mathematics',
      teacherId: teacher1.uid,
      description: 'Numbers, games and puzzles',
      classLevel: 'CM1',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      createdAt: serverTimestamp(),
    })
    const frenchCourseRef = await addDoc(coursesCol, {
      title: 'French Stories',
      subject: 'French',
      teacherId: teacher2.uid,
      description: 'Reading, writing and storytelling',
      classLevel: 'CE2',
      videoUrl: '',
      createdAt: serverTimestamp(),
    })
    const scienceCourseRef = await addDoc(coursesCol, {
      title: 'Science Explorers',
      subject: 'Science',
      teacherId: teacher1.uid,
      description: 'Experiments and discoveries',
      classLevel: 'CM1',
      videoUrl: '',
      createdAt: serverTimestamp(),
    })

    // Assignments
    const assignmentsCol = collection(db, 'assignments')
    const hw1Ref = await addDoc(assignmentsCol, {
      courseId: mathCourseRef.id,
      title: 'Homework 1: Fractions',
      description: 'Practice adding and subtracting fractions.',
      dueDate: serverTimestamp(),
      type: 'homework',
    })
    const quiz1Ref = await addDoc(assignmentsCol, {
      courseId: mathCourseRef.id,
      title: 'Quiz 1: Multiplication',
      description: 'Short quiz on multiplication tables.',
      dueDate: serverTimestamp(),
      type: 'quiz',
    })
    const test1Ref = await addDoc(assignmentsCol, {
      courseId: scienceCourseRef.id,
      title: 'Test: The Solar System',
      description: 'End-of-unit test about the planets.',
      dueDate: serverTimestamp(),
      type: 'test',
    })
    const hw2Ref = await addDoc(assignmentsCol, {
      courseId: frenchCourseRef.id,
      title: 'Homework: Reading',
      description: 'Read a short story and answer questions.',
      dueDate: serverTimestamp(),
      type: 'homework',
    })
    const quiz2Ref = await addDoc(assignmentsCol, {
      courseId: frenchCourseRef.id,
      title: 'Quiz: Vocabulary',
      description: 'Match words with their meanings.',
      dueDate: serverTimestamp(),
      type: 'quiz',
    })

    // Grades
    const gradesCol = collection(db, 'grades')
    async function addGrade(studentUser, assignmentRef, courseRef, score, max, feedback) {
      await addDoc(gradesCol, {
        studentId: studentUser.uid,
        assignmentId: assignmentRef.id,
        courseId: courseRef.id,
        score,
        maxScore: max,
        feedback,
        gradedAt: serverTimestamp(),
      })
    }

    await addGrade(student1, hw1Ref, mathCourseRef, 18, 20, 'Great work!')
    await addGrade(student2, hw1Ref, mathCourseRef, 15, 20, 'Good effort, review fractions.')
    await addGrade(student1, quiz1Ref, mathCourseRef, 9, 10, 'Excellent!')
    await addGrade(student3, hw2Ref, frenchCourseRef, 16, 20, 'Nice reading.')
    await addGrade(student4, quiz2Ref, frenchCourseRef, 8, 10, 'Very good.')

    // Attendance (last 2 weeks)
    const attendanceCol = collection(db, 'attendance')
    const today = new Date()
    for (let i = 0; i < 14; i += 1) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)

      const statusOptions = ['present', 'absent', 'late']
      const randomStatus = (indexOffset) =>
        statusOptions[(i + indexOffset) % statusOptions.length]

      for (const student of [student1, student2, student3, student4]) {
        await addDoc(attendanceCol, {
          studentId: student.uid,
          date: d,
          status: randomStatus(student.uid.length),
          markedBy: student.uid === student1.uid || student.uid === student2.uid ? teacher1.uid : teacher2.uid,
        })
      }
    }

    // Messages between teacher and parent
    const messagesCol = collection(db, 'messages')
    await addDoc(messagesCol, {
      senderId: teacher1.uid,
      receiverId: parent1.uid,
      senderRole: 'teacher',
      content: 'Ahmed has been doing great in maths this week!',
      read: false,
      sentAt: serverTimestamp(),
    })
    await addDoc(messagesCol, {
      senderId: parent1.uid,
      receiverId: teacher1.uid,
      senderRole: 'parent',
      content: "Thank you! We're very proud of him.",
      read: false,
      sentAt: serverTimestamp(),
    })

    console.info('EduKids seed data created successfully.')

    // Re-auth as admin for convenience
    await signInWithEmailAndPassword(auth, 'admin@edukids.com', 'admin123')

    return createdUsers
  } catch (error) {
    console.error('Error seeding EduKids data:', error)
    throw error
  }
}

