"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "../../../components/ui/card"
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { Users, BookOpen, TrendingUp, AlertCircle } from "lucide-react"
import { useAuth } from "../../../src/contexts/AuthContext"
import { useTest } from "../../../src/hooks/useTest"
import { useNotifications } from "../../../src/hooks/useNotification"
import { useAttendance } from "../../../src/hooks/useAttendance"
import api from "../../../src/services/api/api"
import { useClasses } from "../../../src/contexts/ClassContext"

interface StatCardProps {
    title: string
    value: number | string
    icon: any
    color: string
}

// Cập nhật: Thêm border dark:border-white
const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
    <Card className="p-6 border dark:border-white">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-3xl font-bold mt-2">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
    </Card>
)

export default function SchoolOverview() {
    const { user } = useAuth()
    const { tests, fetchTests, loading: testLoading } = useTest()
    const { fetchNotifications } = useNotifications()
    const { attendances, fetchAllAttendances, loading: attendanceLoading } = useAttendance()
    const { classes } = useClasses()

    const [students, setStudents] = useState<any[]>([])
    const [teachers, setTeachers] = useState<any[]>([])
    const [warningCount, setWarningCount] = useState(0)
    const [loading, setLoading] = useState(true)

    const classroomUtilization = useMemo(() => {
        if (!classes?.length) return []
        return classes.map(c => ({
            classroom: c.class_name,
            capacity: c.capacity,
            usage: c.class_size,
        }))
    }, [classes])

    useEffect(() => {
        if (!user) {
            setLoading(false)
            return
        }

        let isMounted = true
        setLoading(true)
        const token = (user as any)?.token || localStorage.getItem("access_token")
        if (!token) {
            setLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                const [studentRes, teacherRes] = await Promise.all([
                    api.get("/students/", { headers: { Authorization: `Bearer ${token}` } }),
                    api.get("/teachers/", { headers: { Authorization: `Bearer ${token}` } }),
                ])
                if (!isMounted) return
                setStudents(studentRes.data ?? [])
                setTeachers(teacherRes.data ?? [])

                await fetchTests(0, 100)

                const notifs = await fetchNotifications()
                if (Array.isArray(notifs)) {
                    setWarningCount(notifs.filter(n => n.type === "warning").length)
                }

                await fetchAllAttendances()
            } catch (err: any) {
                console.error("❌ Fetch data error:", err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchData()
        return () => { isMounted = false }
    }, [user, fetchTests, fetchNotifications, fetchAllAttendances])

    const avgGPA = tests.length > 0
        ? (tests.reduce((sum, t) => sum + (t.score || 0), 0) / tests.length).toFixed(2)
        : "-"

    const attendanceData = useMemo(() => {
        if (!attendances?.length) return []
        const grouped: Record<string, number> = {}
        attendances.forEach(a => {
            const month = new Date(a.attendance_date).toLocaleString('default', { month: 'short' })
            grouped[month] = (grouped[month] ?? 0) + 1
        })
        return Object.entries(grouped)
            .map(([month, count]) => ({ month, attendance: count }))
            .sort((a, b) => {
                const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
            })
    }, [attendances])

    const gradeDistribution = useMemo(() => {
        if (!tests?.length) return []

        const groups = { "0-4": 0, "5-7": 0, "8-9": 0, "10": 0 }

        tests.forEach(t => {
            const score = t.score ?? 0
            if (score <= 4) groups["0-4"] += 1
            else if (score <= 7) groups["5-7"] += 1
            else if (score <= 9) groups["8-9"] += 1
            else if (score === 10) groups["10"] += 1
        })

        return Object.entries(groups).map(([name, value], index) => ({
            name,
            value,
            fill:
                name === "0-4" ? "#ef4444" :
                    name === "5-7" ? "#f97316" :
                        name === "8-9" ? "#eab308" :
                            "#22c55e",
            labelOffset: index * 5
        }))
    }, [tests])

    if (loading || testLoading || attendanceLoading) return <div>Loading...</div>

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={students.length} icon={Users} color="bg-blue-500" />
                <StatCard title="Faculty Members" value={teachers.length} icon={BookOpen} color="bg-green-500" />
                <StatCard title="Average GPA" value={avgGPA} icon={TrendingUp} color="bg-purple-500" />
                <StatCard title="Alerts" value={warningCount} icon={AlertCircle} color="bg-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cập nhật: Thêm border dark:border-white */}
                <Card className="p-6 border dark:border-white">
                    <h2 className="text-xl font-bold mb-4">Attendance Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Cập nhật: Thêm border dark:border-white */}
                <Card className="p-6 border dark:border-white">
                    <h2 className="text-xl font-bold mb-4">Grade Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={gradeDistribution}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                labelLine={true}
                                label={({ cx, cy, midAngle, outerRadius, value, name, index }) => {
                                    if (value === 0) return null
                                    const RADIAN = Math.PI / 180
                                    const radius = outerRadius + 10 + gradeDistribution[index].labelOffset
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN)
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN)
                                    const textAnchor = x > cx ? 'start' : 'end'
                                    return (
                                        // Lưu ý: fill="#000" sẽ không thấy trong darkmode, nên đổi thành class hoặc fill="currentColor"
                                        <text x={x} y={y} className="fill-black dark:fill-white" textAnchor={textAnchor} dominantBaseline="central" fontSize={12}>
                                            {`${name}: ${value}`}
                                        </text>
                                    )
                                }}
                            />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Cập nhật: Thêm border dark:border-white */}
            <Card className="p-6 border dark:border-white">
                <h2 className="text-xl font-bold mb-4">Classroom Utilization</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={classroomUtilization}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="classroom" />
                        <YAxis domain={[0, 'dataMax']} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="usage" fill="#3b82f6" name="Current Usage" />
                        <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    )
}