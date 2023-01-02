import { trpc } from "@/utils/trpc"
import { TextInput, Button } from "@dotkomonline/ui"
import Link from "next/link"
import { useRouter } from "next/router"
import { FC, PropsWithChildren } from "react"
import { useForm } from "react-hook-form"
import OnlineIcon from "../atoms/OnlineIcon"

interface LoginFormProps {
  challenge: string
}

const LoginForm: FC<PropsWithChildren<LoginFormProps>> = ({ challenge, children }) => {
  const { register, handleSubmit } = useForm()
  const router = useRouter()

  const login = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      router.push(data.redirectTo)
    },
  })

  return (
    <form
      className="my-0 mx-auto grid gap-2 px-14 py-16"
      onSubmit={handleSubmit(async (data) => {
        login.mutate({
          email: data.email,
          password: data.password,
          challenge: challenge,
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
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-blue-11">
          Sign up
        </Link>
      </p>
    </form>
  )
}

export default LoginForm
