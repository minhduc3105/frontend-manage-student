"use client"

import { useState, useCallback } from "react"
import toast from "react-hot-toast" 
import {
    getTeacherReviews,
    getTeacherReviewsByTeacherId,
    getTeacherReviewsByStudentId,
    createTeacherReview,
    updateTeacherReview,
    deleteTeacherReview,
    TeacherReviewView,
    TeacherReviewCreate,
    TeacherReviewUpdate,
} from "../../src/services/api/teacherReview"

export function useTeacherReviews() {
    const [reviews, setReviews] = useState<TeacherReviewView[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // --- HÀM FETCH DỮ LIỆU (CHỈ TOAST LỖI) ---

    const fetchAllReviews = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getTeacherReviews()
            setReviews(data)
            return data
        } catch (err: any) {
            const msg = err.message || "Lỗi tải tất cả đánh giá."
            toast.error(msg) 
            setError(msg)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchReviewsByTeacherId = useCallback(async (teacherUserId: number) => {
        setLoading(true)
        setError(null)
        try {
            const data = await getTeacherReviewsByTeacherId(teacherUserId)
            setReviews(data)
            return data
        } catch (err: any) {
            const msg = err.message || "Lỗi tải đánh giá theo giáo viên."
            toast.error(msg)
            setError(msg)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchReviewsByStudentId = useCallback(async (studentUserId: number) => {
        setLoading(true)
        setError(null)
        try {
            const data = await getTeacherReviewsByStudentId(studentUserId)
            setReviews(data)
            return data
        } catch (err: any) {
            const msg = err.message || "Lỗi tải đánh giá theo học sinh."
            toast.error(msg)
            setError(msg)
            return null
        } finally {
            setLoading(false)
        }
    }, [])
    
    // --- HÀM THAO TÁC DỮ LIỆU (TOAST THÀNH CÔNG VÀ LỖI) ---

    const createReview = useCallback(async (newReview: TeacherReviewCreate) => {
        setLoading(true);
        setError(null);
        try {
            await createTeacherReview(newReview);
            await fetchAllReviews();
            toast.success("Tạo đánh giá thành công!"); 
            return true;
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Lỗi khi tạo đánh giá.";
            toast.error(msg); 
            setError(msg);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchAllReviews]);

    const updateReview = useCallback(async (reviewId: number, updatedReview: TeacherReviewUpdate) => {
        setLoading(true);
        setError(null);
        try {
            await updateTeacherReview(reviewId, updatedReview);
            await fetchAllReviews(); 
            toast.success(`Cập nhật đánh giá ID ${reviewId} thành công!`); 
            return true;
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Lỗi khi cập nhật đánh giá.";
            toast.error(msg);
            setError(msg);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchAllReviews]);

    const deleteReview = useCallback(async (reviewId: number) => {
        setLoading(true);
        setError(null);
        try {
            await deleteTeacherReview(reviewId);
            await fetchAllReviews(); 
            toast.success(`Xóa đánh giá ID ${reviewId} thành công!`); 
            return true;
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Lỗi khi xóa đánh giá.";
            toast.error(msg);
            setError(msg);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchAllReviews]);

    
    return {
        reviews,
        loading,
        error,
        fetchAllReviews,
        fetchReviewsByTeacherId,
        fetchReviewsByStudentId,
        createReview,
        updateReview,
        deleteReview
    }
}