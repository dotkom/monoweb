// THIS FILE IS TEMPORARY. NO NEED TO REVIEW IT.

import { type FC } from "react"
import Link from "next/link"

const SuccessPage: FC = () => (
  <div>
    <Link href="/payment-test" className="bg-blue-5 hover:bg-blue-6 p-4">
      Go back
    </Link>
    <h1 className="text-green-11 mt-10">The payment was successful!</h1>
  </div>
)

export default SuccessPage
