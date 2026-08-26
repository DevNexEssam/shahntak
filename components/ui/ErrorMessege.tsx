import { FaExclamationTriangle } from 'react-icons/fa'

export const ErrorMessege = ({ message, error }: { message?: string; error?: string }) => {
    const displayMessage = message || error || "حدث خطأ ما";
    return (
        <>
            <div className="fixed top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                <FaExclamationTriangle />
                <span>{displayMessage}</span>
            </div>
        </>
    )
}

export default ErrorMessege