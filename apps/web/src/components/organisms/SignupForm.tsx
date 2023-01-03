"use client"
import { trpc } from "@/utils/trpc"
import { Button, TextInput } from "@dotkomonline/ui"
import Link from "next/link"
import { useForm } from "react-hook-form"
import OnlineIcon from "../atoms/OnlineIcon"
import { signIn } from "next-auth/react"

interface FormData {
  email: string
  name: string
  password1: string
  password2: string
}

export const SignupForm = () => {
  const { register, handleSubmit, setError } = useForm<FormData>()
  const signup = trpc.auth.signup.useMutation({
    onSuccess: () => {
      signIn("onlineweb")
    },
  })

  return (
    <form
      className="my-0 mx-auto grid gap-2 px-14 py-16"
      onSubmit={handleSubmit(async (data) => {
        if (data.password1 != data.password2) {
          setError("password2", { message: "Passwords do not match" })
        }
        signup.mutate({
          email: data.email,
          name: data.name,
          password: data.password1,
        })
      })}
    >
      <div className="mx-auto mb-6 w-[120px]">
        <OnlineIcon className="fill-slate-12" />
      </div>
      <h1 className="text-accent mx-auto text-2xl font-semibold">Sign up</h1>

      <TextInput id="email" label="Email" {...register("email")} required />
      <TextInput id="name" label="Full name" {...register("name")} />
      <TextInput id="password" label="Password" {...register("password1")} required />
      <TextInput id="password2" label="Verify password" {...register("password2")} required />
      <Button className="my-4" variant="gradient" type="submit" disabled={signup.isLoading}>
        Sign up
      </Button>
      <p className="text-slate-12 mb-4 text-center">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-blue-11">
          Login
        </Link>
      </p>
    </form>
  )
}
