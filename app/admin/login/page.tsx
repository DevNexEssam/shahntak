import AdminLogin from '@/components/admin/AdminLogin'
import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

const page = async () => {
    const session = await getServerSession(authOptions)
    if (session) {
        redirect("/error")
    }
    return (
        <AdminLogin />
    )
}

export default page