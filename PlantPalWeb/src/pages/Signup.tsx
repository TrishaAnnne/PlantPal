import React, { useState } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import deerBg from "../assets/deer-bg.jpg";
import plantpalTitle from "../assets/plantpal-title.png";
import backgroundBox from "../assets/background.png";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Optional password strength check
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasMinLength || !hasNumber || !hasUppercase || !hasSpecialChar) {
      alert("Password is too weak");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Signup failed");
        return;
      }

      alert(`Signed up successfully!\n\nWelcome ${data.user.username} 🌱`);
      // Redirect to login
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const strengthCount =
    (password.length >= 8 ? 1 : 0) +
    (/\d/.test(password) ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 1 : 0);

  let passwordHint = "";
  if (strengthCount < 4) {
    if (password.length < 8) passwordHint = "At least 8 characters required";
    else if (!/\d/.test(password)) passwordHint = "Add a number";
    else if (!/[A-Z]/.test(password)) passwordHint = "Add an uppercase letter";
    else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) passwordHint = "Add a special character";
  } else passwordHint = "Strong password ✔";

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${deerBg})` }}
      />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Signup Box */}
      <div
        className="relative w-full max-w-md p-8 rounded-2xl shadow-lg backdrop-blur-md"
        style={{
          backgroundImage: `url(${backgroundBox})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <img
          src={plantpalTitle}
          alt="PlantPal+"
          className="mx-auto w-56 sm:w-60 md:w-72 mb-0"
        />
        <h2 className="text-2xl font-bold text-[#2F4F2F] text-center mb-1">Welcome</h2>
        <p className="text-base text-gray-700 text-center mb-6">
          Let's create your PlantPal account
        </p>

        <form onSubmit={handleSignUp} className="space-y-5">
          {/* Email */}
          <div className="flex items-center bg-[#e1e9d7] rounded-full px-4 py-3 w-full mb-4">
            <input
              type="email"
              placeholder="Email"
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base pl-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="flex-shrink-0 ml-2 w-10 h-10 rounded-full bg-[#faffef] flex items-center justify-center">
              <Mail className="text-gray-600" size={20} />
            </div>
          </div>

          {/* Password */}
          <div className="flex items-center bg-[#e1e9d7] rounded-full px-4 py-3 w-full mb-1">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base pl-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex-shrink-0 ml-2 w-10 h-10 rounded-full bg-[#faffef] flex items-center justify-center hover:bg-gray-200 transition"
            >
              {showPassword ? <EyeOff size={20} className="text-gray-600"/> : <Eye size={20} className="text-gray-600"/>}
            </button>
          </div>

          {/* Password Strength */}
          <div className="flex space-x-1 mb-2 mt-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded`}
                style={{ backgroundColor: i < strengthCount ? "#3B6E3B" : "#ccc" }}
              />
            ))}
          </div>
          {password.length > 0 && (
            <p className="text-sm text-red-600 mb-3 mt-3">{passwordHint}</p>
          )}

          {/* Confirm Password */}
          <div className="flex items-center bg-[#e1e9d7] rounded-full px-4 py-3 w-full mb-4">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base pl-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="flex-shrink-0 ml-2 w-10 h-10 rounded-full bg-[#faffef] flex items-center justify-center hover:bg-gray-200 transition"
            >
              {showConfirmPassword ? <EyeOff size={20} className="text-gray-600"/> : <Eye size={20} className="text-gray-600"/>}
            </button>
          </div>

          {confirmPassword.length > 0 && confirmPassword !== password && (
            <p className="text-sm text-red-600 mb-3">✖ Passwords do not match</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3B6E3B] text-white rounded-[20px] py-3 font-semibold flex justify-center hover:bg-[#2E5C2E] active:bg-[#1F401F] disabled:opacity-50"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
                className="text-[#579755] font-medium hover:underline"
                onClick={() => navigate("/login")} // ✅ proper React navigation
            >
                Login
            </button>
            </p>
      </div>
    </div>
  );
}
