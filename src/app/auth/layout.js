import React from 'react'

const AuthLayout = ({ children }) => {
  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      {children}
    </div>
  )
}

export default AuthLayout