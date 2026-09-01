"use client"

import { useSession } from "next-auth/react"

const CompanyDashboard = () => {
  const session = useSession()
  console.log("session : " , session.data)
  return (
    <div>CompanyDashboard</div>
  )
}

export default CompanyDashboard