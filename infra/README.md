# Infrastructure

All infrastructure as code defined in Terraform lies here.

Make sure you are using Terraform Workspaces to separate deployment environments. For a primer on workspaces in
terraform, see https://developer.hashicorp.com/terraform/language/state/workspaces.

Monoweb deploys to three environments:

- dev
- stg
- prd

Each environment maps to the environment with the same name in the Doppler workspace.

## Tags

To keep track of the origin of any AWS resource, ensure you are properly tagging the resources created. Each resource
should have the `Project` tag set to `Monoweb`. Each resource should also have a `Module` tag set to the terraform module/
project it originates from. There should also be an `Environment` tag that matches the deployment environment name.

The easiest way to ensure this happens, is by adding the following `default_tags` to your AWS provider block:

```terraform
tags = {
  Project     = "Monoweb"
  Module      = "vercel"
  Environment = terraform.workspace
}
```