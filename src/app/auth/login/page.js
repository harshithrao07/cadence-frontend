'use client'

import React from 'react'
import Image from 'next/image'
import Input from '@/components/Input'
import { Button } from '@material-tailwind/react'

const Login = () => {
  return (
    <div className='flex flex-col items-center'>
      <Image
        src="/cadence-logo.png"
        width={150}
        height={150}
        alt='Cadence'
      />
      <h1 className='text-5xl font-semibold'>Sign up to start listening</h1>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <Input
          htmlFor="username"
          type="text"
          placeholder="name@domain.com"
          name="username"
          value={signinBody.username}
          onChange={handleChange}
        />
        <Input
          htmlFor="password"
          type={type}
          placeholder="Enter your password"
          name="password"
          value={signinBody.password}
          onChange={handleChange}
          handleToggle={handleToggle}
          showPassword={showPassword}
        />
        <button>
          <Button className="mt-5 w-full" variant="filled" loading={loading}>
            Sign in
          </Button>
        </button>
      </form>
    </div>
  )
}

export default Login