# Infrastructure

All infrastructure as code defined in Terraform lies here.

Make sure you are using Terraform Workspaces to separate deployment environments. For a primer on workspaces in
terraform, see https://developer.hashicorp.com/terraform/language/state/workspaces.

Monoweb deploys to three environments:

- dev
- stg
- prd

Each environment maps to the environment with the same name in the Doppler workspace.

## Modules

The terraform config in the /infra directory is a single terraform project, consuming a number of modules defined in /infra/modules.

The root project is where you will be running terraform apply etc.

## Tags

To keep track of the origin of any AWS resource, ensure you are properly tagging the resources created. Each resource
should have the `Project` tag set to `monoweb`.　There should also be an `Environment` tag that matches the deployment environment name.

The easiest way to ensure this happens, is by adding the following `default_tags` to your AWS provider block:

```terraform
tags = {
  Project     = "monoweb"
  Environment = terraform.workspace
}
```

Remember that the tags don't automatically flow down into modules used, so modules should have a tags variable that will
be manually applied to all taggable resources declared in the module.

## Environment variables

To hack on the infrastructure codebase, you need AWS credentials plus environment variables defined.

```bash
# Set up your ~/.aws/credentials with
aws configure

# Get vercel token
export VERCEL_TOKEN=...

export TF_VAR_doppler_token=...
```

