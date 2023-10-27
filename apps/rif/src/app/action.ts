"use server"

export async function action(state: unknown, form: FormData) {
  "use server"
  console.log("Form was submitted")
  return form
}
