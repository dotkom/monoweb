// THIS FILE IS TEMPORARY. NO NEED TO REVIEW IT.

import Link from "next/link";
import { type FC } from "react";

const CancelPage: FC = () => (
    <div>
        <Link className="bg-blue-5 hover:bg-blue-6 p-4" href="/payment-test">
            Go back
        </Link>
        <h1 className="text-red-11 mt-10">The payment was cancelled!</h1>
    </div>
);

export default CancelPage;
