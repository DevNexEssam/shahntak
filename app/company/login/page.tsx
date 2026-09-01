import CompanyLogin from '@/components/company/CompanyLogin'
import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

const page = async () => {
    const session = await getServerSession(authOptions)
    if (session) {
        redirect("/error")
    }
    return (
        <CompanyLogin />
    )
}

export default page