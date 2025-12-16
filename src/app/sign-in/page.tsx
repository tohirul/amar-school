"use client";

import Image from "next/image";
import { useFormState } from "react-dom";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction] = useFormState(login, { error: "" });

  return (
    <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
      <form
        action={formAction}
        className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-4 w-96"
      >
        {/* Logo + Brand */}
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Image src="/logo.png" alt="" width={24} height={24} />
          Amar School
        </h1>

        <h2 className="text-gray-400">Sign in to your account</h2>

        {/* Error message */}
        {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

        {/* Username / Email / Phone */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">
            Username / Email / Phone
          </label>
          <input
            name="identifier"
            type="text"
            required
            className="p-2 rounded-md ring-1 ring-gray-300"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Password</label>
          <input
            name="password"
            type="password"
            required
            className="p-2 rounded-md ring-1 ring-gray-300"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="bg-blue-500 text-white my-1 rounded-md text-sm p-[10px]"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
