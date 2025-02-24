import { execSync } from "node:child_process"
import { Command } from "commander"
import { getServices } from "./ecs"

const version = execSync("git rev-parse HEAD").toString().trim()
const program = new Command("monoweb").version(`git sha1:${version}`).description("monoweb deployment tool")

program
  .command("services")
  .description("list active services")
  .action(async () => {
    const services = await getServices()
    console.log(services)
  })

program.parse()
