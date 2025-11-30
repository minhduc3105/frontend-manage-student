import api from "./api"

export interface TestBase {
    test_name: string
    student_user_id: number
    class_id: number
    subject_id: number
    teacher_user_id: number
    score: number
    exam_date: string // date được ánh xạ thành string
    test_type: string

    student_name?: string
    class_name?: string
}

/**
 * Interface đầy đủ cho một bản ghi bài kiểm tra sau khi được tạo.
 */
export interface Test extends TestBase {
    test_id: number
}

/**
 * Interface cho dữ liệu tạo mới bài kiểm tra (POST /).
 * Backend sẽ tự điền subject_id và teacher_user_id dựa trên class_id và người dùng hiện tại.
 */
export interface TestCreate {
    test_name: string
    student_user_id: number
    class_id: number
    score: number
    exam_date: string
    test_type: string
}

/**
 * Interface cho dữ liệu cập nhật bài kiểm tra (PUT /{id}).
 */
export interface TestUpdate {
    test_name?: string
    score?: number
    exam_date?: string // YYYY-MM-DD
}

// ====================================================================
// API FUNCTIONS (Mappings from test_route.py)
// ====================================================================

/**
 * Lấy danh sách tất cả bài kiểm tra (áp dụng phân quyền theo vai trò).
 */
export async function getTests(skip: number = 0, limit: number = 100): Promise<Test[]> {
    const res = await api.get<Test[]>(`/tests?skip=${skip}&limit=${limit}`)
    return res.data
}

/**
 * Lấy thông tin của một bản ghi bài kiểm tra cụ thể bằng ID.
 */
export async function getTestById(test_id: number): Promise<Test> {
    const res = await api.get<Test>(`/tests/${test_id}`)
    return res.data
}

/**
 * Tạo một bài kiểm tra mới.
 */
export async function createTest(data: TestCreate): Promise<Test> {
    const res = await api.post<Test>("/tests/", data)
    return res.data
}

/**
 * Cập nhật một bài kiểm tra.
 */
export async function updateTest(test_id: number, data: TestUpdate): Promise<Test> {
    const res = await api.put<Test>(`/tests/${test_id}`, data)
    return res.data
}

/**
 * Xóa một bản ghi bài kiểm tra cụ thể bằng ID.
 */
export async function deleteTest(test_id: number): Promise<void> {
    await api.delete(`/tests/${test_id}`)
}

/**
 * Lấy tất cả bài kiểm tra của một học sinh.
 */
export async function getTestsForStudent(student_user_id: number, skip: number = 0, limit: number = 100): Promise<Test[]> {
    const res = await api.get<Test[]>(`/tests/student/${student_user_id}?skip=${skip}&limit=${limit}`)
    return res.data
}

/**
 * Lấy tất cả bài kiểm tra của các lớp do một giáo viên giảng dạy.
 */
export async function getTestsForTeacher(teacher_user_id: number, skip: number = 0, limit: number = 100): Promise<Test[]> {
    const res = await api.get<Test[]>(`/tests/teacher/${teacher_user_id}?skip=${skip}&limit=${limit}`)
    return res.data
}

/**
 * Import danh sách điểm kiểm tra từ file Excel vào DB.
 * @param class_id ID của lớp cần import
 * @param file File Excel chứa dữ liệu điểm
 * @returns Object chứa thông báo và kết quả import
 */
export async function importTests(class_id: number, file: File): Promise<{ message: string, result: any }> {
    const formData = new FormData()
    formData.append("file", file)

    const res = await api.post<{ message: string, result: any }>(`/tests/import?class_id=${class_id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data' // Cần thiết khi gửi file
        }
    })
    return res.data
}
