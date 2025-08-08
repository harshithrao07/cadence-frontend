'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Input from '@/components/Input'
import { Button, Checkbox, List, ListItem, ListItemPrefix, Typography } from '@material-tailwind/react'
import { CustomStepper } from '@/components/CustomStepper'

const Signup = () => {
  const [signupBody, setSignupBody] = useState({
    email: "",
    password: "",
    name: ""
  })
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const passwordConditions = [
    "1 letter",
    "1 number or special character (example: # ? ! &)",
    "10 characters"
  ]

  const handleSubmit = () => {

  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSignupBody((prevValue) => ({
      ...prevValue,
      [name]: value
    }));
  }

  const handleToggle = () => {
    setShowPassword(!showPassword);
  }

  const handleNext = () => {
    if (activeStep < 2) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  }

  return (
    <div className='flex flex-col items-center h-screen justify-center'>
      <div className='flex flex-col items-center justify-center gap-y-5'>
        <Image
          src="/cadence-logo.png"
          width={50}
          height={50}
          alt='Cadence'
        />
        {activeStep == 0 && <h1 className='text-5xl font-semibold text-center'>Sign up to<br /> start listening</h1>}
      </div>

      {activeStep != 0 && <CustomStepper activeStep={activeStep} setActiveStep={setActiveStep} />}

      <div className='flex flex-col items-center justify-center gap-y-4 w-1/3 mt-5'>
        <div className="self-start flex items-center gap-x-6 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>

          <div>
            {
              activeStep == 1
              &&
              <>
                <p className='text-gray-500'>Step {activeStep} of 3</p>
                <p>Create a password</p>
              </>

            }
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col w-full">
          {
            activeStep == 0 && (
              <Input
                type="text"
                placeholder="Email Address"
                name="email"
                value={signupBody.email}
                onChange={handleChange}
              />
            )
          }

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
              <div className='mt-8 text-sm'>
                Your password must contain at least<br />
                {
                  passwordConditions.map((condition, index) => (
                    <>
                      <Checkbox
                        key={index}
                        disabled={true}
                        color="red"
                        className='rounded-full h-3 w-3'
                        label={condition}
                        labelProps={{ className: "text-gray-100" }}
                      />
                      <br />
                    </>
                  ))
                }
              </div>
            </div>
          )}

          {
            activeStep === 2 && (
              <Input
                type="text"
                placeholder="Name"
                name="name"
                value={signupBody.name}
                onChange={handleChange}
              />
            )
          }
          <div className='mt-8'>
            <Button color='red' className="w-full rounded-full" variant="gradient" onClick={handleNext}>
              Next
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup