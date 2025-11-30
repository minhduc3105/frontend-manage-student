import api from "./api/api";

export interface IUser {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
  phone?: string;
  gender?: string;
  dob?: string;
}

export interface ILoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
  phone?: string;
  gender?: string;
  dob?: string;
}

const TOKEN_KEY = "access_token";
const USER_KEY = "user";
const AUTH_BROADCAST_KEY = "app_auth_event";

class AuthService {
  private _token: string | null = null;
  private _user: IUser | null = null;
  private _initialized = false;
  private _bc: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this._bc = new BroadcastChannel("app_auth_channel");
    }
  }

  /** 🚀 Khởi tạo: load token + user từ localStorage */
  async init(): Promise<void> {
    if (typeof window === "undefined") {
      this._initialized = true;
      return;
    }

    this._token = localStorage.getItem(TOKEN_KEY);
    this._user = this._safeGetUser();
    console.log("AuthService:init loaded", {
      token: this._token,
      user: this._user,
    });

    if (this._token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${this._token}`;
    }

    // Chỉ refresh nếu token tồn tại và đã có cookie
    if (this._token && document.cookie.includes("refresh_token=")) {
      try {
        await this.refreshToken();
      } catch (e) {
        console.warn("Refresh token failed, need re-login:", e);
      }
    }

    this._initialized = true;
  }

  private _safeGetUser(): IUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as IUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }

  /** Getter/setter token */
  get token(): string | null {
    if (typeof window === "undefined") return null;
    if (!this._token) this._token = localStorage.getItem(TOKEN_KEY);
    return this._token;
  }

  set token(value: string | null) {
    this._token = value;
    if (typeof window === "undefined") return;
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
  }

  /** Getter/setter user */
  get user(): IUser | null {
    if (!this._user) this._user = this._safeGetUser();
    return this._user;
  }

  set user(u: IUser | null) {
    this._user = u;
    if (typeof window === "undefined") return;
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  }

  /** Gửi tín hiệu auth event cho các tab */
  private broadcast(event: {
    type: "login" | "logout" | "token-changed";
    ts?: number;
    user?: any;
  }) {
    if (typeof window === "undefined") return;
    const payload = { ...event, ts: Date.now() };
    try {
      localStorage.setItem(AUTH_BROADCAST_KEY, JSON.stringify(payload));
      this._bc?.postMessage(payload);
    } catch {
      /* ignore */
    }
  }

  /** 🧠 Đăng nhập bằng username/password */
  async login({ username, password }: { username: string; password: string }) {
    try {
      console.log("[1] AuthService: login called with", { username });

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      console.log("[2] Raw response status:", res.status, res.statusText);

      const payload = await res.json().catch((err) => {
        console.error("[3] JSON parse error:", err);
        return {};
      });

      console.log("[4] Parsed payload:", payload);

      if (!res.ok) {
        const message = payload?.detail || payload?.message || "Login failed";
        console.error("[5] Login failed:", message);
        throw new Error(message);
      }

      const data = payload as ILoginResponse;
      console.log("[6] ILoginResponse data:", data);

      this.token = data.access_token;
      console.log("[7] Access token:", this.token);

      const userData: IUser = {
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        roles: data.roles || [],
        phone: data.phone,
        gender: data.gender,
        dob: data.dob,
      };
      console.log("[8] Extracted userData:", userData);

      this.user = userData;

      api.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
      console.log("[9] Set default Authorization header");

      console.log("[10] Before reloadFromStorage:", this.user);
      this.reloadFromStorage();
      console.log("[11] After reloadFromStorage:", this.user);

      this.broadcast({
        type: "login",
        user: { user_id: userData.user_id, username: userData.username },
      });
      console.log("[12] Broadcasted login event");

      console.log("[13] AuthService: login successful", userData);
      return { success: true, user: userData };
    } catch (err: any) {
      console.error("[14] AuthService: login error", err);
      return { success: false, error: err?.message || "Login failed" };
    }
  }

  /** 📝 Đăng ký tài khoản mới */
  async register(formData: {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
    date_of_birth?: string;
    gender?: string;
  }) {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // nếu backend set cookie
        body: JSON.stringify(formData),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          payload?.detail || payload?.message || "Register failed";
        throw new Error(message);
      }

      // Nếu backend trả luôn access_token & user info giống login
      if (payload.access_token) {
        this.token = payload.access_token;
        const userData: IUser = {
          user_id: payload.user_id,
          username: payload.username,
          email: payload.email,
          full_name: payload.full_name,
          roles: payload.roles || [],
          phone: payload.phone_number,
          gender: payload.gender,
          dob: payload.date_of_birth,
        };
        this.user = userData;
        api.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;

        this.broadcast({
          type: "login",
          user: { user_id: userData.user_id, username: userData.username },
        });
      }

      return { success: true, data: payload };
    } catch (err: any) {
      return { success: false, error: err?.message || "Register failed" };
    }
  }

  /** 🚪 Đăng xuất hoàn toàn */
  async logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }

    this.token = null;
    this.user = null;
    this._initialized = false;
    delete api.defaults.headers.common["Authorization"];
    this.broadcast({ type: "logout" });
  }

  /** 🔄 Làm mới token từ cookie refresh */
  async refreshToken(): Promise<string | null> {
    try {
      if (!this.user || !this.token) return null;

      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Refresh failed");

      const data = await res.json();
      const newToken = data.access_token;
      this.token = newToken;
      this.broadcast({ type: "token-changed" });

      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      return newToken;
    } catch (e) {
      this.logout();
      throw e;
    }
  }

  /** 🔍 Lấy user hiện tại (GET /auth/me) */
  async fetchUser(): Promise<IUser | null> {
    if (!this.token) return null;
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Fetch user failed");

      const data = await res.json();
      const userData: IUser = {
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        roles: data.roles || [],
        phone: data.phone,
        gender: data.gender,
        dob: data.dob,
      };

      this.user = userData;
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      this.logout();
      return null;
    }
  }

  /** 🧭 Đăng nhập bằng Google (SSO) */
  async loginWithGoogle(code: string) {
    try {
      const res = await fetch(
        `/api/auth/google?code=${encodeURIComponent(code)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.detail || "Google login failed");

      const data = payload as ILoginResponse;
      this.token = data.access_token;

      const userData: IUser = {
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        roles: data.roles || [],
        phone: data.phone,
        gender: data.gender,
        dob: data.dob,
      };
      this.user = userData;
      this.broadcast({
        type: "login",
        user: { user_id: userData.user_id, username: userData.username },
      });

      return { success: true, user: userData };
    } catch (err: any) {
      return { success: false, error: err.message || "Google login failed" };
    }
  }

  /** 🪄 Dành cho callback SSO (URL có token) */
  async handleTokenAndFetchUser(token: string): Promise<IUser | null> {
    try {
      this.token = token;
      const user = await this.fetchUser();
      if (user) {
        this.broadcast({
          type: "login",
          user: { user_id: user.user_id, username: user.username },
        });
      }
      return user;
    } catch (e) {
      this.logout();
      throw e;
    }
  }

  /** Reload user/token khi tab khác thay đổi */
  reloadFromStorage() {
    this._token = localStorage.getItem(TOKEN_KEY);
    this._user = this._safeGetUser();
  }

  /** Kiểm tra trạng thái auth */
  isAuthenticated(): boolean {
    return this._initialized && !!this.token && !!this.user;
  }

  hasRole(role: string): boolean {
    return !!this.user?.roles?.includes(role);
  }

  getDashboardRoute(): string {
    const user = this.user;
    if (!user || !user.roles?.length) return "/login";
    if (user.roles.includes("manager")) return "/manager-dashboard";
    if (user.roles.includes("teacher")) return "/teacher-dashboard";
    if (user.roles.includes("student")) return "/student-dashboard";
    if (user.roles.includes("parent")) return "/parent-dashboard";
    return "/login";
  }
}

export default new AuthService();
