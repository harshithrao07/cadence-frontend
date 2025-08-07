'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Input from '@/components/Input'
import { Button } from '@material-tailwind/react'

const Signup = () => {
  const [signupBody, setSignupBody] = useState({
    email: "",
    password: ""
  })
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className='flex flex-col items-center gap-y-4'>
      <Image
        src="/cadence-logo.png"
        width={50}
        height={50}
        alt='Cadence'
      />
      <h1 className='text-5xl font-semibold text-center'>Sign up to<br /> start listening</h1>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <Input
          htmlFor="Email Address"
          type="text"
          placeholder="name@domain.com"
          name="email"
          value={signupBody.email}
          onChange={handleChange}
        />
        <Input
          htmlFor="Password"
          type="password"
          placeholder="Enter your password"
          name="password"
          value={signupBody.password}
          onChange={handleChange}
          handleToggle={handleToggle}
          showPassword={showPassword}
        />
        <Button className="mt-5 w-full" variant="filled" loading={loading}>
          Sign in
        </Button>
      </form>
    </div>
  )
}

export default Signup