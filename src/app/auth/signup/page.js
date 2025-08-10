"use client";

import React, { useState } from "react";
import Image from "next/image";
import Input from "@/components/Input";
import { Button, Checkbox } from "@material-tailwind/react";
import { CustomStepper } from "@/components/CustomStepper";
import DatePicker from "@/components/DatePicker";
import ProfilePictureSelector from "@/components/ProfilePictureSelector";
import Link from "next/link";

const Signup = () => {
  const [signupBody, setSignupBody] = useState({
    email: "",
    password: "",
    name: "",
    dob: new Date(),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [invalidPasswordConditions, setInvalidPasswordConditions] = useState([
    false,
    false,
    false,
  ]);

  const passwordConditions = [
    "1 letter",
    "1 number or special character (example: # ? ! &)",
    "10 characters",
  ];
  const hasSpecialOrNumber = /[0-9!@#$%^&*(),.?":{}|<>]/;

  const handleSubmit = () => {
    console.log(signupBody);
  };

  const validateStep = (step) => {
    if (step === 0) {
      if (!signupBody.email.trim()) {
        setError("Email is required");
        return false;
      }

      if (!signupBody.email.includes("@")) {
        setError("Invalid email");
        return false;
      }
    }

    if (step === 1) {
      if (!signupBody.password.trim()) {
        setError("Password is required");
        return false;
      }

      if (!hasSpecialOrNumber.test(signupBody.password)) {
        setError("Password must contain a number or special character");
        return false;
      }

      if (signupBody.password.length < 10) {
        setError("Password must contain at least 10 characters");
        return false;
      }
    }

    if (step === 2) {
      if (!signupBody.name.trim()) {
        setError("Name is required");
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSignupBody((prevValue) => ({
      ...prevValue,
      [name]: value,
    }));

    if (name === "email") {
      if (value.trim().length > 0) {
        setError("");
      }

      if (value.includes("@")) {
        setError("");
      }
    } else if (name === "password") {
      const updatedConditions = [
        value.trim().length > 0, // not empty
        hasSpecialOrNumber.test(value), // contains special char or number
        value.length >= 10, // at least 10 characters
      ];

      if (
        updatedConditions[0] &&
        updatedConditions[1] &&
        updatedConditions[2]
      ) {
        setError("");
      }
      setInvalidPasswordConditions(updatedConditions);
    } else if (name === "name") {
      if (value.trim().length > 0) {
        setError("");
      }
    }
  };

  const handleToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      if (activeStep < 3) {
        setActiveStep((prev) => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <div className="flex flex-col items-center h-screen justify-center">
      <div className="flex flex-col items-center justify-center gap-y-5">
        <Image src="/cadence-logo.png" width={50} height={50} alt="Cadence" />
        {activeStep == 0 && (
          <h1 className="text-5xl font-semibold text-center">
            Sign up to
            <br /> start listening
          </h1>
        )}
      </div>

      {activeStep != 0 && (
        <CustomStepper activeStep={activeStep} setActiveStep={setActiveStep} />
      )}

      <div className="flex flex-col items-center w-full h-1/2">
        <div className="flex flex-col items-center justify-center gap-y-4 w-1/3">
          <div className="self-start flex items-center gap-x-6 mb-3">
            {activeStep != 0 && (
              <svg
                onClick={handlePrevious}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-8 cursor-pointer"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            )}

            <div>
              {activeStep != 0 && (
                <p className="text-gray-500">Step {activeStep} of 3</p>
              )}
              {activeStep == 1 && <p>Create a password</p>}
              {activeStep == 2 && <p>Tell us about yourself</p>}
              {activeStep == 3 && <p>Add a profile picture (Optional)</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col w-full">
            {activeStep == 0 && (
              <>
                <Input
                  type="email"
                  placeholder="Email Address"
                  name="email"
                  value={signupBody.email}
                  onChange={handleChange}
                  required={true}
                  errorText={error}
                />
              </>
            )}

            {activeStep === 1 && (
              <div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  value={signupBody.password}
                  onChange={handleChange}
                  handleToggle={handleToggle}
                  showPassword={showPassword}
                  required={true}
                  errorText={error}
                />
                <div className="mt-8 text-sm">
                  Your password must contain at least
                  <br />
                  {passwordConditions.map((condition, index) => (
                    <div key={index}>
                      <Checkbox
                        disabled={true}
                        checked={invalidPasswordConditions[index]}
                        className="rounded-full h-3 w-3"
                        label={condition}
                        labelProps={{ className: "text-gray-100" }}
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-5 text-red-500"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        }
                        ripple={false}
                      />
                      <br />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="flex flex-col gap-y-6">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-500 mb-2">
                    This name will appear on your profile
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={signupBody.name}
                    onChange={handleChange}
                    required={true}
                    placeholder={"Name"}
                    errorText={error}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-500 mb-2">
                    Add your date of birth — optional.
                  </label>
                  <DatePicker />
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="flex flex-col">
                <ProfilePictureSelector />
              </div>
            )}

            <div className="mt-6">
              <Button
                ripple={false}
                color="red"
                className="w-full text-black rounded-full shadow-none hover:shadow-none hover:bg-red-400 normal-case text-md"
                variant="filled"
                onClick={handleNext}
              >
                {activeStep != 3 ? "Next" : "Sign up"}
              </Button>
            </div>
          </form>

          {activeStep == 0 && (
            <>
              <div className="flex items-center w-full">
                <div className="flex-grow h-px bg-gray-600"></div>
                <span className="mx-2 text-white text-md font-medium">or</span>
                <div className="flex-grow h-px bg-gray-600"></div>
              </div>

              <Button
                variant="outlined"
                ripple={false}
                color="blue-gray"
                className="relative w-full rounded-full normal-case text-md font-outfit text-white hover:border-white hover:opacity-100"
              >
                <Image
                  src="https://docs.material-tailwind.com/icons/google.svg"
                  alt="google"
                  height={20}
                  width={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                />

                <span className="block w-full text-center">
                  Sign up with Google
                </span>
              </Button>

              <hr className="mt-4 border-t w-full border-gray-800" />

              <p className="text-gray-500">
                Already have an account?{" "}
                <Link className="underline text-white" href="/auth/login">
                  Log in here
                </Link>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
