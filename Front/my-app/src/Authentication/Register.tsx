import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      alert(res.data.message);
      navigate("/");
    } catch (err: unknown) {
      const error = err as any;
      alert(error.response?.data?.message || "Error occurred");
    }
  };

  return (
    <div>
      <main className="mx-auto flex min-h-screen w-full items-center justify-center bg-gray-600 text-white">
        <section className="flex w-xl flex-col space-y-8">

          <div className="text-center text-4xl font-medium">
            Create Account
          </div>

          <form className="w-full flex flex-col space-y-6" onSubmit={handleSubmit}>

            {/* Name */}
            <div className="w-full border-b-2 bg-transparent text-lg focus-within:border-indigo-500">
              <input
                type="text"
                placeholder="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-transparent outline-none placeholder:italic"
              />
            </div>

            {/* Email */}
            <div className="w-full border-b-2 bg-transparent text-lg focus-within:border-indigo-500">
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-transparent outline-none placeholder:italic"
              />
            </div>

            {/* Password */}
            <div className="w-full border-b-2 bg-transparent text-lg focus-within:border-indigo-500">
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-transparent outline-none placeholder:italic"
              />
            </div>

            {/* Confirm Password */}
            <div className="w-full border-b-2 bg-transparent text-lg focus-within:border-indigo-500">
              <input
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full bg-transparent outline-none placeholder:italic"
              />
            </div>

            {/* Role */}
            <div className="w-full border-b-2 bg-transparent text-lg focus-within:border-indigo-500">
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full bg-transparent outline-none placeholder:italic"
              >
                <option disabled className="bg-gray-500 text-gray-800" value="">Select Role</option>
                <option className="bg-gray-500 text-gray-800" value="customer">Customer</option>
                <option className="bg-gray-500 text-gray-800" value="seller">Seller</option>
              </select>
            </div>

            {/* Button */}
            <button className="rounded-sm bg-indigo-600 py-2 font-bold duration-300 hover:bg-indigo-400" type="submit">
              SIGN UP
            </button>

          </form>

          <p className="text-center text-lg text-gray-300">
            Already have an account?{" "}
            <a href="/" className="text-indigo-400 underline hover:text-indigo-300">
              Login
            </a>
          </p>


        </section>
      </main>
    </div>
  )
}