"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { UsersProvider } from "./UsersContext";
import { SubjectProvider } from "./SubjectContext";
import { ClassesProvider } from "./ClassContext";
import { ScheduleProvider } from "./ScheduleContext";
import { StudentProvider } from "./StudentContext";
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: ReactNode }) {
    // ✅ Đã xoá đoạn "if (!mounted) return <>{children}</>" để tránh mất Context

    return (
        <AuthProvider>
            <UsersProvider>
                <SubjectProvider>
                    <ClassesProvider>
                        <ScheduleProvider>
                            <StudentProvider>
                                {/* ThemeProvider bọc trong cùng theo yêu cầu của bạn */}
                                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                                    {children}
                                </ThemeProvider>
                            </StudentProvider>
                        </ScheduleProvider>
                    </ClassesProvider>
                </SubjectProvider>
            </UsersProvider>
        </AuthProvider>
    );
}