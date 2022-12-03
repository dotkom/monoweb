import { Button, TextInput } from "@dotkomonline/ui"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import { z } from "zod"

import OnlineIcon from "../../components/atoms/OnlineIcon"
import { trpc } from "../../utils/trpc"
import type { NextPageWithLayout } from "../_app"

const SignInPage: NextPageWithLayout = () => {
  const router = useRouter()
  const challenge = router.query["login_challenge"]
  const { register, handleSubmit } = useForm()

  const login = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      console.log(data)
    },
  })

  return (
    <div className="bg-slate-1 mx-auto my-0 w-full max-w-[400px] rounded-md pt-16">
      <form
        className="my-0 mx-auto grid gap-2 px-14 py-16"
        onSubmit={handleSubmit(async (data) => {
          if (typeof challenge != "string") {
            return
          }
          login.mutate({
            email: data.email,
            password: data.password,
            challenge: z.string().parse(challenge),
          })
        })}
      >
        <div className="mx-auto mb-6 w-[120px]">
          <OnlineIcon className="fill-slate-12" />
        </div>
        <h1 className="text-accent mx-auto text-2xl font-semibold">Login</h1>
        <p className="text-slate-12 text-center">Continue to Onlineweb</p>
        <TextInput id="email" label="Email" {...register("email")} />
        <TextInput id="password" label="Password" {...register("password")} />
        <span className="text-sm">
          Forgot your <a className="text-blue-11">password?</a>
        </span>
        <Button className="my-4" variant="gradient" type="submit">
          Login
        </Button>
        <p className="text-slate-12 text-center">
          Don&apos;t have an account? <a className="text-blue-11">Sign up</a>
        </p>
      </form>
    </div>
  )
}

SignInPage.getLayout = (page) => {
  return <div className="bg-slate-1 sm:bg-background h-full w-full pt-16">{page}</div>
}

export default SignInPage
