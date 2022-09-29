import { Button, css, Text, TextInput } from "@dotkom/ui"

const Login = () => {
  return (
    <div className={styles.background()}>
      <div className={styles.container()}>
        <h1 className={styles.heading()}>Log in to Onlineweb</h1>
        <form className={styles.form()}>
          <TextInput id="username" name="username" placeholder="Username" label="Username" />
          <TextInput id="password" name="password" placeholder="Password" label="Password" />
          <span className={styles.forgotPassword()}>
            Forgot your <a className={styles.link()}>password?</a>
          </span>
          <Button className={styles.link()}>Login</Button>
        </form>
        <Text size="sm">
          Don't have an account? <a className={styles.link()}>Sign up</a>
        </Text>
      </div>
    </div>
  )
}

const styles = {
  background: css({
    width: "100%",
    height: "100%",
  }),
  container: css({
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    maxWidth: "480px",
    padding: "0 $3",
  }),
  heading: css({
    fontWeight: "600",
    color: "$blue1",
    fontSize: "$3xl",
    marginBottom: "$1",
  }),
  description: css({
    textAlign: "center",
  }),
  form: css({
    display: "grid",
    gap: "$2",
    padding: "$2 0",
    width: "80%",
    margin: "0 auto"
  }),
  forgotPassword: css({
    fontSize: "$sm",
  }),
  button: css({
    width: "100%",
    marginTop: "$2",
  }),
  link: css({
    color: "$info4",
  }),
}

export default Login
