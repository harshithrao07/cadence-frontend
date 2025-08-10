"use client";

import React, { useState } from "react";
import Image from "next/image";
import Input from "@/components/Input";
import { Button } from "@material-tailwind/react";
import Link from "next/link";
import { InputOneTimePassword } from "@/components/InputOneTimePassword";

const Login = () => {
  const [loginBody, setLoginBody] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [selectedLoginMode, setSelectedLoginMode] = useState(null);

  const loginMode = {
    PASSWORD: "password",
    OTP: "otp",
  };

  const handleSubmit = () => {
    console.log(signupBody);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setLoginBody((prevValue) => ({
      ...prevValue,
      [name]: value,
    }));
  };

  const handleToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleClick = () => {
    if (selectedLoginMode == null) {
      if (!loginBody.email.trim()) {
        setError("Email is required");
        return;
      }

      if (!loginBody.email.includes("@")) {
        setError("Invalid email");
        return;
      }
      setSelectedLoginMode(loginMode.OTP);
    } else if (selectedLoginMode == loginMode.OTP) {
      setSelectedLoginMode(loginMode.PASSWORD);
    } else if (selectedLoginMode == loginMode.PASSWORD) {
      setSelectedLoginMode(null);
    }

    setError("");
  };

  return (
    <div className="container mx-auto flex justify-center items-center min-h-screen m-8">
      {selectedLoginMode == null || selectedLoginMode == loginMode.PASSWORD ? (
        <div className="w-full max-w-2xl bg-gray-900 p-8 rounded-xl shadow-lg flex flex-col items-center gap-y-6">
          <div className="flex flex-col items-center justify-center gap-y-2">
            <Image
              src="/cadence-logo.png"
              width={40}
              height={40}
              alt="Cadence"
            />
            <h1 className="text-4xl font-semibold text-center">
              Log in to Cadence
            </h1>
          </div>

          <div className="flex flex-col items-center justify-center gap-y-8 w-full">
            <Button
              variant="outlined"
              ripple={false}
              color="blue-gray"
              className="relative w-1/2 rounded-full normal-case text-md font-outfit text-white hover:border-white hover:opacity-100"
            >
              <Image
                src="https://docs.material-tailwind.com/icons/google.svg"
                alt="google"
                height={20}
                width={20}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />

              <span className="block w-full text-center">
                Continue with Google
              </span>
            </Button>

            <hr className="border-t w-5/6 border-gray-800" />

            <form
              onSubmit={handleSubmit}
              className="flex flex-col w-1/2 gap-y-3"
            >
              <div>
                <Input
                  type="email"
                  name="email"
                  value={loginBody.email}
                  onChange={handleChange}
                  errorText={error}
                  placeholder="Email Address"
                />
              </div>

              {selectedLoginMode == loginMode.PASSWORD && (
                <div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    value={loginBody.password}
                    onChange={handleChange}
                    handleToggle={handleToggle}
                    showPassword={showPassword}
                    errorText={error}
                  />
                </div>
              )}

              <Button
                ripple={false}
                color="red"
                className="w-full mt-3 text-black rounded-full shadow-none hover:shadow-none hover:bg-red-400 normal-case text-md"
                variant="filled"
                onClick={handleClick}
              >
                {selectedLoginMode == loginMode.OTP || selectedLoginMode == null
                  ? "Continue"
                  : "Log in"}
              </Button>
            </form>

            <p
              onClick={handleClick}
              className="underline cursor-pointer hover:text-red-500"
            >
              Log in without password
            </p>

            <p className="text-gray-500">
              Don&apos;t have an account?{" "}
              <Link className="underline text-white" href="/auth/signup">
                Sign up for Cadence
              </Link>
              .
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-y-5">
          <p className="text-2xl font-semibold">
            Enter the 6-digit code sent to <br /> you at {loginBody.email}.
          </p>
          <InputOneTimePassword />
          <Button
            variant="outlined"
            color="white"
            className="rounded-full normal-case text-sm"
            size="sm"
          >
            Resend code
          </Button>
          <Button
            ripple={false}
            color="red"
            className="w-full mt-5 text-black rounded-full shadow-none hover:shadow-none hover:bg-red-400 normal-case text-md"
            variant="filled"
            onClick={handleClick}
          >
            Log in
          </Button>
          <p
            onClick={handleClick}
            className="font-semibold mt-3 cursor-pointer hover:scale-105 duration-200"
          >
            Log in with a password
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
