import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import deerBg from "../assets/deer-bg.jpg";
import plantpalTitle from "../assets/plantpal-title.png";
import backgroundBox from "../assets/background.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Fake loading (just to use setLoading so TS/ESLint doesn’t complain)
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${deerBg})` }}
      />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Centered login box */}
      <div
        className="relative w-full max-w-md p-8 rounded-2xl shadow-lg backdrop-blur-md"
        style={{
          backgroundImage: `url(${backgroundBox})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Logo */}
        <img
          src={plantpalTitle}
          alt="PlantPal+"
          className="mx-auto w-56 sm:w-60 md:w-72 mb-0"
        />

        <h2 className="text-2xl font-bold text-[#2F4F2F] text-center mb-1">
          Welcome back!
        </h2>
        <p className="text-base text-gray-700 text-center mb-6">
          Sign in to your PlantPal account
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="flex items-center bg-[#e1e9d7] rounded-[50px] px-3.5 py-2 w-full mb-4">
            <input
              type="email"
              placeholder="Email"
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base pl-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex-shrink-0 ml-2 w-10 h-10 rounded-full bg-[#faffef] flex items-center justify-center">
              <Mail className="text-gray-600" size={20} />
            </div>
          </div>

          {/* Password */}
          <div className="flex items-center bg-[#e1e9d7] rounded-[50px] px-3.5 py-2 w-full mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base pl-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex-shrink-0 ml-2 w-10 h-10 rounded-full bg-[#faffef] flex items-center justify-center hover:bg-gray-200 transition"
            >
              {showPassword ? (
                <EyeOff className="text-gray-600" size={20} />
              ) : (
                <Eye className="text-gray-600" size={20} />
              )}
            </button>
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-[#333]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-5 h-5 accent-green-600"
              />
              Remember Me
            </label>
            <button
              type="button"
              className="text-[#579755] hover:underline"
              onClick={() => alert("Forgot password flow")}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="
              w-full
              bg-[#3B6E3B]
              text-white
              rounded-[20px]
              py-3
              flex justify-center
              font-semibold
              hover:bg-[#2E5C2E]
              active:bg-[#1F401F]
              transition
              disabled:opacity-50
            "
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Don&apos;t have an account?{" "}
            <button
            className="text-[#579755] font-medium hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
