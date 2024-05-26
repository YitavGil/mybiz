import { getAuthUserDeatils } from '@/lib/queries';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import React from 'react'

const Page = async () => {
  const authUser = await currentUser();
  if(!authUser) return redirect("/sign-in");

  const agencyId = await verifyAndAcceptinvitation() 

    //get user details

    const user = getAuthUserDeatils()
  return (
    <div>Agency</div>
  )
}

export default Page