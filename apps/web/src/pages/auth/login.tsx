import OnlineIcon from "@/components/atoms/OnlineIcon"
import { Button, css, Text, TextInput } from "@dotkom/ui"
import { NextPageWithLayout } from "../_app"

const Login: NextPageWithLayout = () => {
  return (
    <div className={styles.container()}>
      <form className={styles.form()}>
        <div className={styles.iconContainer()}>
          <OnlineIcon />
        </div>
        <h1 className={styles.heading()}>Sign in</h1>
        <Text className={styles.continueTo()}>Continue to Onlineweb</Text>
        <TextInput id="username" name="username" label="Username" />
        <TextInput id="password" name="password" label="Password" />
        <span className={styles.forgotPassword()}>
          Forgot your <a className={styles.link()}>password?</a>
        </span>
        <Button className={styles.button()}>Sign in</Button>
        <Text size="sm" className={styles.registerText()}>
          Don&apos;t have an account? <a className={styles.link()}>Sign up</a>
        </Text>
      </form>
    </div>
  )
}

Login.getLayout = (page) => {
  return <div className={styles.layout()}>{page}</div>
}

const styles = {
  layout: css({
    width: "100%",
    height: "100%",
    background: "white",
    "@sm": {
      background: "linear-gradient(315deg, hsla(215, 90%, 96%, 1) 0%, hsla(46, 100%, 95%, 1) 100%)",
    },
    paddingTop: "$1",
  }),
  container: css({
    margin: "$6 auto 0 auto",
    padding: "$5 $3",
    display: "flex",
    backgroundColor: "$white",
    flexDirection: "column",
    justifyContent: "center",
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
  continueTo: css({
    textAlign: "center",
  }),
  description: css({
    textAlign: "center",
  }),
  form: css({
    display: "grid",
    gap: "$2",
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
  registerText: css({
    textAlign: "center",
  }),
}

export default Login
