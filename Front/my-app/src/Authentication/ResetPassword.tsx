import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password }
      );

      alert(res.data.message);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-600 text-black">
      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded w-96">
        <h2 className="text-xl mb-4">Reset Password</h2>

        <input
          type="password"
          placeholder="New Password"
          className="w-full p-2 mb-4 text-black"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-indigo-600 p-2">
          Reset Password
        </button>
      </form>
    </div>
  );
}