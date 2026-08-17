import { Student } from '../types';
import { apiDelete, apiGet, apiPost, apiPut } from './api';

export interface ApiStudent {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  contact?: string;
  gender?: 'Male' | 'Female' | 'Other';
  roomNumber?: string | null;
  block?: string | null;
  joinDate?: string;
}

export function mapApiStudentToStudent(apiStudent: ApiStudent): Student {
  return {
    id: apiStudent._id,
    name: apiStudent.name,
    studentId: apiStudent.studentId,
    email: apiStudent.email,
    contact: apiStudent.contact || '',
    gender: apiStudent.gender || 'Male',
    roomNumber: apiStudent.roomNumber ?? null,
    block: apiStudent.block ?? null,
    joinDate: apiStudent.joinDate || new Date().toISOString().split('T')[0],
  };
}

export function mapStudentToPayload(student: Omit<Student, 'id'> | Student) {
  return {
    name: student.name,
    studentId: student.studentId,
    email: student.email,
    contact: student.contact,
    gender: student.gender,
    roomNumber: student.roomNumber,
    block: student.block,
    joinDate: student.joinDate,
  };
}

export async function fetchStudents(): Promise<Student[]> {
  const data = await apiGet<ApiStudent[]>('/students');
  return data.map(mapApiStudentToStudent);
}

export async function createStudent(student: Omit<Student, 'id'>): Promise<Student> {
  const created = await apiPost<ApiStudent>('/students', mapStudentToPayload(student));
  return mapApiStudentToStudent(created);
}

export async function updateStudentApi(student: Student): Promise<Student> {
  const updated = await apiPut<ApiStudent>(`/students/${student.id}`, mapStudentToPayload(student));
  return mapApiStudentToStudent(updated);
}

export async function deleteStudentApi(id: string): Promise<void> {
  await apiDelete(`/students/${id}`);
}
