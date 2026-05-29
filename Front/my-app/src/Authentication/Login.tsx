import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string>("");

    const G_Login = async (credentialResponse: any) => {
        try {
            const res = await axios.post("http://localhost:5000/api/auth/google", {
                token: credentialResponse.credential,
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", res.data.user._id);
            navigate("/");
        } catch (err) {
            console.log(err);
        }
    };

    const C_Login = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        const form = e.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;

        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password,
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", res.data.user._id);
            localStorage.setItem("role", res.data.user.role);

            const role = res.data.user.role;
            if (role === "seller") {
                navigate("/sellerbody");
            } else {
                navigate("/");
            }
        } catch (err: any) {
            const message =
                err.response?.data?.message || "Something went wrong";

            setError(message);
        }
    };

    return (
        <div>
            <main className="mx-auto flex min-h-screen w-full items-center justify-center bg-gray-600 text-white">
                <section className="flex w-xl flex-col space-y-10">
                    <div className="text-center text-4xl font-medium">Log In</div>
                    <form className="w-full flex flex-col space-y-6" onSubmit={C_Login}>
                        <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
                            <input name="email" type="email" placeholder="Email" className="w-full border-none bg-transparent outline-none placeholder:italic focus:outline-none" />
                        </div>

                        <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
                            <input name="password" type="password" placeholder="Password" className="w-full border-none bg-transparent outline-none placeholder:italic focus:outline-none" />
                        </div>

                        <button className="transform rounded-sm bg-indigo-600 py-2 font-bold duration-300 hover:bg-indigo-400" type="submit">
                            LOG IN
                        </button>
                    </form>
                    {error && (
                        <p style={{ color: "red", background: "#ffe5e5", padding: "10px", borderRadius: "5px", width: "fit-content" }}>
                            {error}
                        </p>
                    )}
                    <a href="/forgot" className="transform text-center font-semibold text-gray-500 duration-300 hover:text-gray-300">FORGOT PASSWORD?</a>

                    <p className="text-center text-lg">
                        No account?
                        <a href="/register" className=" ml-2 font-bold text-indigo-900 underline-offset-4 hover:underline">Create One</a>
                    </p>
                    <span className="mb-2 flex justify-center text-gray-200">Or</span>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <GoogleLogin onSuccess={G_Login} onError={() => console.log("Login Failed")} />
                    </div>
                </section>
            </main>
        </div>
    )
}

export default Login
