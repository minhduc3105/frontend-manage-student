"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, Users, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParents } from "../../src/hooks/useParent";

export interface Child {
  name: string;
  email: string;
  gender: string;
  phone_number: string;
  date_of_birth: string;
}

interface ChildrenManagementProps {
  parent: any; // kiểu User
}

export default function ChildrenManagement({ parent }: ChildrenManagementProps) {
  const { children, fetchParentChildren, loading } = useParents();
  const [expandedChild, setExpandedChild] = useState<string | null>(null);

  useEffect(() => {
    if (parent?.user_id) {
      fetchParentChildren(parent.user_id).then((data: Child[] | null) => {
        if (data && data.length > 0) {
          setExpandedChild(data[0].email); // mở child đầu tiên theo email
        }
      });
    }
  }, [parent, fetchParentChildren]);

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case "Male":
        return "from-blue-500 to-cyan-500";
      case "Female":
        return "from-pink-500 to-rose-500";
      default:
        return "from-purple-500 to-indigo-500";
    }
  };

  const getGenderIcon = (gender: string) => {
    return gender === "Male" ? "♂" : gender === "Female" ? "♀" : "⚧";
  };

  return (
    <div className="h-full bg-background rounded-2xl shadow p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg text-white">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Children Management</h2>
          <p className="text-sm text-muted-foreground">View your children's information</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : children.length > 0 ? (
        <div className="space-y-4">
          {children.map((child: Child, index: number) => (
            <motion.div
              key={child.email || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Child Header */}
              <button
                onClick={() =>
                  setExpandedChild(expandedChild === child.email ? null : child.email)
                }
                className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${getGenderColor(
                      child.gender
                    )} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                  >
                    {child.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-foreground">{child.name}</h3>
                    <p className="text-sm text-muted-foreground">{child.email}</p>
                  </div>
                </div>
                {expandedChild === child.email ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {/* Child Details */}
              <AnimatePresence>
                {expandedChild === child.email && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 bg-background">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoCard
                          label="Full Name"
                          value={child.name}
                          icon={<User className="w-5 h-5 text-white" />}
                          bg="from-blue-500 to-cyan-500"
                        />
                        <InfoCard
                          label="Email Address"
                          value={child.email}
                          icon={<Mail className="w-5 h-5 text-white" />}
                          bg="from-purple-500 to-pink-500"
                        />
                        <InfoCard
                          label="Gender"
                          value={child.gender}
                          icon={
                            <span className="text-2xl text-white">
                              {getGenderIcon(child.gender)}
                            </span>
                          }
                          bg={getGenderColor(child.gender)}
                        />
                        <InfoCard
                          label="Phone Number"
                          value={child.phone_number}
                          icon={<Phone className="w-5 h-5 text-white" />}
                          bg="from-orange-500 to-amber-500"
                        />
                        <InfoCard
                          label="Date of Birth"
                          value={new Date(child.date_of_birth).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                          icon={<Calendar className="w-5 h-5 text-white" />}
                          bg="from-indigo-500 to-violet-500"
                          fullWidth
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No children information available</p>
        </div>
      )}
    </div>
  );
}

/* Reusable InfoCard component */
function InfoCard({
  label,
  value,
  icon,
  bg,
  fullWidth,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={`group ${fullWidth ? "md:col-span-2" : ""}`}>
      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border hover:shadow-md transition-all">
        <div className={`p-3 bg-gradient-to-br ${bg} rounded-lg shadow-lg`}>{icon}</div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-base font-semibold text-foreground mt-1 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}
