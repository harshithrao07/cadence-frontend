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
  const passwordConditions = [
    "1 letter",
    "1 number or special character (example: # ? ! &)",
    "10 characters",
  ];

  const handleSubmit = () => {};

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSignupBody((prevValue) => ({
      ...prevValue,
      [name]: value,
    }));
  };

  const handleToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleNext = () => {
    if (activeStep < 3) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleSubmit();
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

      <div className="flex flex-col items-center justify-center gap-y-4 w-1/4 mt-5">
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
            {activeStep == 3 && <p>Add a profile picture</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col w-full">
          {activeStep == 0 && (
            <Input
              type="text"
              placeholder="Email Address"
              name="email"
              value={signupBody.email}
              onChange={handleChange}
            />
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
              />
              <div className="mt-8 text-sm">
                Your password must contain at least
                <br />
                {passwordConditions.map((condition, index) => (
                  <div key={index}>
                    <Checkbox
                      disabled={true}
                      color="red"
                      className="rounded-full h-3 w-3"
                      label={condition}
                      labelProps={{ className: "text-gray-100" }}
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
                <label>Name</label>
                <label className="text-sm text-gray-500 mb-2">
                  This name will appear on your profile
                </label>
                <Input
                  type="text"
                  name="name"
                  value={signupBody.name}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col">
                <label>Date of birth</label>
                <label className="text-sm text-gray-500 mb-2">
                  Add your date of birth — you can do this later.
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

          <span className="block w-full text-center">Sign up with Google</span>
        </Button>

        <hr className="mt-4 border-t w-full border-gray-800" />

        <p className="text-gray-500">
          Already have an account?{" "}
          <Link className="underline text-white" href="/auth/login">
            Log in here
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Signup;
