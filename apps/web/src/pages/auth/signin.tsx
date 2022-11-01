import OnlineIcon from "@/components/atoms/OnlineIcon"
import { trpc } from "@/utils/trpc"
import { Button, css, Text, TextInput } from "@dotkomonline/ui"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"

import type { NextPageWithLayout } from "../_app"

const SignInPage: NextPageWithLayout = () => {
  const router = useRouter()
  const loginChallenge = router.query["login_challenge"]
  console.log(loginChallenge)
  const { register, handleSubmit } = useForm()

  const signIn = trpc.signin.useMutation()

  return (
    <div className="bg-slate-1 mx-auto my-0 w-full max-w-[400px] rounded-md pt-16">
      <form
        className="my-0 mx-auto grid gap-2 px-14 py-16"
        onSubmit={handleSubmit(async (data) => {
          signIn.mutate(
            {
              username: data.username,
              password: data.password,
              loginChallenge: loginChallenge as string,
            },
            { onSuccess: (data) => console.log(data) }
          )
        })}
      >
        <div className="my-0 mx-auto w-[120px]">
          <OnlineIcon />
        </div>
        <h1 className="text-accent mx-auto text-2xl font-semibold">Sign in</h1>
        <p className="text-slate-12 text-center">Continue to Onlineweb</p>
        <TextInput id="username" label="Username" {...register("username")} />
        <TextInput id="password" label="Password" {...register("password")} />
        <span className={styles.forgotPassword()}>
          Forgot your <a className={styles.link()}>password?</a>
        </span>
        <Button className={styles.button()} color="blue" type="submit">
          Sign in
        </Button>
        <p className="text-slate-12 text-center">
          Don&apos;t have an account? <a className={styles.link()}>Sign up</a>
        </p>
      </form>
    </div>
  )
}

SignInPage.getLayout = (page) => {
  return <div className="bg-background h-full w-full pt-16">{page}</div>
}

const styles = {
  container: css({
    display: "flex",
    backgroundColor: "$white",
    maxWidth: "400px",
    width: "100%",
    "@sm": {
      boxShadow: "$md",
    },
    borderRadius: "$2",
  }),
  iconContainer: css({
    width: "120px",
    margin: "0 auto",
  }),
  heading: css({
    margin: "$3 auto 0 auto",
    fontWeight: "600",
    color: "$blue1",
    fontSize: "$3xl",
  }),
  form: css({
    display: "grid",
    gap: "$2",
    padding: "$5 $4",
    width: "100%",
    maxWidth: "380px",
    margin: "0 auto",
  }),
  forgotPassword: css({
    fontSize: "$sm",
  }),
  button: css({
    width: "100%",
    marginTop: "$3",
    padding: "12px 0",
  }),
  link: css({
    color: "$info4",
  }),
}

export default SignInPage
