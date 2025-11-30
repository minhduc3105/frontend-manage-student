"use client";


import { BarChart3 } from "lucide-react";

// Import chỉ SchoolOverview
import SchoolOverview from "./SchoolOverview";

export default function ManagerReport() {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-background shadow-md flex-shrink-0">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">Manager Panel</h2>
                    <ul>
                        <li className="flex items-center gap-3 p-3 rounded-lg bg-blue-600 text-white">
                            <BarChart3 className="w-5 h-5" />
                            School Overview
                        </li>
                    </ul>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto bg-background">
                <h1 className="text-background font-bold mb-6">School Overview</h1>
                <SchoolOverview />
            </main>
        </div>
    );
}
