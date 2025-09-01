import React from 'react'

const VendorLogoutPage = () => {
  return (
    <div  className='space-y-8 p-4 md:p-6 lg:p-8'>
        <h2 className="text-[black] text-xl lg:text-2xl font-semibold">Logout</h2>
        <p>are you sure you want to logout</p>
        <button className='px-4 py-2 bg-[#0164CE] text-white'>Yes, Logout →</button>
    </div>
  )
}

export default VendorLogoutPage;