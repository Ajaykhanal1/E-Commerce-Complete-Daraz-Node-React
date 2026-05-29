import { useState } from "react";
import axios from "axios";


export default function ForgotPassword() {
    const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email,
      });

      alert(res.data.message);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };
  return (
    <div>
      <main className="mx-auto flex min-h-screen w-full items-center justify-center bg-gray-600 text-white">
        <section className="flex w-xl flex-col space-y-8">

          <div className="text-center text-4xl font-medium">
            Forgot Password
          </div>

          <p className="text-center text-gray-400">
            Enter your email and we’ll send you a reset link.
          </p>





          <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="w-full border-b-2 bg-transparent text-lg focus-within:border-indigo-500">
            <input
              type="email"
              placeholder="Email"
              name="email"
              className="w-full bg-transparent outline-none placeholder:italic"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Button */}
          <button type="submit" className="rounded-sm bg-indigo-600 py-2 font-bold duration-300 hover:bg-indigo-400">
            SEND RESET LINK
          </button>
          </form>








          <p className="text-center text-gray-300">
            Remember password?{" "}
            <a href="/" className="text-indigo-400 underline hover:text-indigo-300">
              Login
            </a>
          </p>

        </section>
      </main>
    </div>
  )
}