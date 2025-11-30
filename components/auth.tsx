"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { User, Lock, Mail, Eye, EyeOff, Phone, Calendar } from "lucide-react";
import { useRouter } from "next/navigation"; // Import useRouter
import authService from "../src/services/authService.ts";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone_number: "",
    date_of_birth: "",
    gender: "other",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter(); // Khởi tạo router

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setSuccessMessage("");
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      full_name: "",
      phone_number: "",
      date_of_birth: "",
      gender: "other",
    });
  };

  const validateForm = () => {
    console.log("validateForm được gọi với dữ liệu:", formData);
    const newErrors: Record<string, string> = {};

    if (isLogin) {
      if (!formData.username) {
        newErrors.username = "Username or email is required";
      }
    } else {
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
      if (!formData.full_name) {
        newErrors.full_name = "Full name is required";
      }
      if (!formData.phone_number) {
        newErrors.phone_number = "Phone number is required";
      }
      if (!formData.date_of_birth) {
        newErrors.date_of_birth = "Date of birth is required";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      if (isLogin) {
        const result = await authService.login({
          username: formData.username,
          password: formData.password,
        });

        if (result.success) {
          setSuccessMessage("Login successful! Redirecting to dashboard...");
          setTimeout(() => {
            const dashboardRoute = authService.getDashboardRoute();
            router.push(dashboardRoute); // Sử dụng router.push
          }, 1500);
        } else {
          setErrors({ general: result.error || "Login failed" });
        }
      } else {
        const result = await authService.register({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          date_of_birth: formData.date_of_birth,
          gender: "other",
        });

        if (result.success) {
          setSuccessMessage(
            "Account created successfully! Please login to continue."
          );
          setTimeout(() => {
            setIsLogin(true);
            setFormData({
              username: formData.email,
              email: "",
              password: "",
              confirmPassword: "",
              full_name: "",
              phone_number: "",
              date_of_birth: "",
              gender: "other",
            });
          }, 2000);
        } else {
          setErrors({ general: result.error || "Registration failed" });
        }
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`handleInputChange: ${field} = ${value}`);
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0072ff] via-[#0080ff] to-[#00c6ff]">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-background/10 rounded-full blur-3xl"
          animate={{
            x: [-128, -100, -128],
            y: [-128, -100, -128],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-80 h-80 bg-background/10 rounded-full blur-3xl"
          animate={{
            x: [128, 100, 128],
            y: [128, 100, 128],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-64 h-64 bg-background/5 rounded-full blur-2xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="flex mb-6 bg-background/20 backdrop-blur-sm rounded-xl p-1 border border-white/20"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 relative ${
                isLogin
                  ? "text-[#0072ff] shadow-lg"
                  : "text-gray-100 hover:bg-white/20 hover:text-white"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLogin && (
                <motion.div
                  className="absolute inset-0 bg-background rounded-lg"
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Login</span>
            </motion.button>
            <motion.button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 relative ${
                !isLogin
                  ? "text-[#0072ff] shadow-lg"
                  : "text-gray-100 hover:bg-white/20 hover:text-white"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {!isLogin && (
                <motion.div
                  className="absolute inset-0 bg-background rounded-lg"
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Sign Up</span>
            </motion.button>
          </motion.div>

          {(successMessage || errors.general) && (
            <motion.div
              className={`mb-4 p-4 rounded-lg text-center font-medium ${
                successMessage
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {successMessage || errors.general}
            </motion.div>
          )}

          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={isLogin ? 1 : -1}>
              {isLogin ? (
                <motion.div
                  key="login"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-2xl p-8 border border-white/20">
                    <motion.div
                      className="text-center mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <h1 className="text-3xl font-bold text-card-foreground mb-2">
                        Welcome Back
                      </h1>
                      <p className="text-muted-foreground">
                        Please enter your login and password
                      </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                          type="text"
                          placeholder="Username or Email"
                          value={formData.username}
                          onChange={(e) =>
                            handleInputChange("username", e.target.value)
                          }
                          className={`pl-12 h-12 bg-input border-border focus:border-primary transition-colors ${
                            errors.username ? "border-destructive" : ""
                          }`}
                          required
                        />
                        {errors.username && (
                          <motion.p
                            className="text-destructive text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.username}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                      >
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          className={`pl-12 pr-12 h-12 bg-input border-border focus:border-primary transition-colors ${
                            errors.password ? "border-destructive" : ""
                          }`}
                          required
                        />
                        <motion.button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </motion.button>
                        {errors.password && (
                          <motion.p
                            className="text-destructive text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.password}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                      >
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold transition-all duration-200 hover:scale-[1.02] shadow-lg disabled:opacity-50"
                        >
                          {loading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                              }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            "Login"
                          )}
                        </Button>
                      </motion.div>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-muted-foreground">
                        Don't have an account?{" "}
                        <button
                          onClick={toggleMode}
                          className="text-primary hover:text-primary/80 font-semibold transition-colors"
                        >
                          Sign up
                        </button>
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  custom={-1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-2xl p-8 border border-white/20">
                    <motion.div
                      className="text-center mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <h1 className="text-3xl font-bold text-card-foreground mb-2">
                        Create Account
                      </h1>
                      <p className="text-muted-foreground">
                        Create your account to get started
                      </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                          type="text"
                          placeholder="Full Name"
                          value={formData.full_name}
                          onChange={(e) =>
                            handleInputChange("full_name", e.target.value)
                          }
                          className={`pl-12 h-12 bg-input border-border focus:border-primary transition-colors ${
                            errors.full_name ? "border-destructive" : ""
                          }`}
                          required
                        />
                        {errors.full_name && (
                          <motion.p
                            className="text-destructive text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.full_name}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                      >
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                          type="email"
                          placeholder="Email Address"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className={`pl-12 h-12 bg-input border-border focus:border-primary transition-colors ${
                            errors.email ? "border-destructive" : ""
                          }`}
                          required
                        />
                        {errors.email && (
                          <motion.p
                            className="text-destructive text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.email}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45, duration: 0.4 }}
                      >
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                          type="tel"
                          placeholder="Phone Number"
                          value={formData.phone_number}
                          onChange={(e) =>
                            handleInputChange("phone_number", e.target.value)
                          }
                          className={`pl-12 h-12 bg-input border-border focus:border-primary transition-colors ${
                            errors.phone_number ? "border-destructive" : ""
                          }`}
                          required
                        />
                        {errors.phone_number && (
                          <motion.p
                            className="text-destructive text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.phone_number}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.47, duration: 0.4 }}
                      >
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                          type="date"
                          placeholder="Date of Birth"
                          value={formData.date_of_birth}
                          onChange={(e) =>
                            handleInputChange("date_of_birth", e.target.value)
                          }
                          className={`pl-12 h-12 bg-input border-border focus:border-primary transition-colors ${
                            errors.date_of_birth ? "border-destructive" : ""
                          }`}
                          required
                        />
                        {errors.date_of_birth && (
                          <motion.p
                            className="text-destructive text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.date_of_birth}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                      >
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          className={`pl-12 pr-12 h-12 bg-input border-border focus:border-primary transition-colors ${
                            errors.password ? "border-destructive" : ""
                          }`}
                          required
                        />
                        <motion.button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </motion.button>
                        {errors.password && (
                          <motion.p
                            className="text-destructive text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.password}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                      >
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          className={`pl-12 pr-12 h-12 bg-input border-border focus:border-primary transition-colors ${
                            errors.confirmPassword ? "border-destructive" : ""
                          }`}
                          required
                        />
                        <motion.button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </motion.button>
                        {errors.confirmPassword && (
                          <motion.p
                            className="text-destructive text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.confirmPassword}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.4 }}
                      >
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold transition-all duration-200 hover:scale-[1.02] shadow-lg disabled:opacity-50"
                        >
                          {loading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                              }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </motion.div>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-muted-foreground">
                        Already have an account?{" "}
                        <button
                          onClick={toggleMode}
                          className="text-primary hover:text-primary/80 font-semibold transition-colors"
                        >
                          Login
                        </button>
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            className="flex justify-center mt-6 space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <motion.div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isLogin ? "bg-white" : "bg-white/50"
              }`}
              animate={{
                scale: isLogin ? 1.2 : 1,
                backgroundColor: isLogin ? "#ffffff" : "rgba(255,255,255,0.5)",
              }}
              whileHover={{ scale: 1.3 }}
            />
            <motion.div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                !isLogin ? "bg-white" : "bg-white/50"
              }`}
              animate={{
                scale: !isLogin ? 1.2 : 1,
                backgroundColor: !isLogin ? "#ffffff" : "rgba(255,255,255,0.5)",
              }}
              whileHover={{ scale: 1.3 }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
