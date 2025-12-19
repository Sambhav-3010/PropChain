import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="text-center ">
      <h1 className="text-3xl font-bold text-green-600">Thanks for submitting!</h1>
      <p>We'll get back to you soon.</p>
      <Link href="/profile" className="text-blue-500 underline">
        Go to Profile
      </Link>
    </div>
  )
}