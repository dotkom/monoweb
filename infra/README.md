# Infrastructure

All infrastructure as code defined in Terraform lies here.

Make sure you are using Terraform Workspaces to separate deployment environments. For a primer on workspaces in
terraform, see https://developer.hashicorp.com/terraform/language/state/workspaces.

Monoweb deploys to two environments:

- dev
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

To work with the Terraform stacks you need AWS credentials and the input variables Terraform expects. We at Dotkom use
Doppler to inject the variables into the Terraform stacks, but you can also export the variables manually. See [`auth0/terraform.tfvars.example`](auth0/terraform.tfvars.example) for an example.

```bash
cd auth0

# Without Doppler you need to create a terraform.tfvars file (once):
cp terraform.tfvars.example terraform.tfvars
# Then edit terraform.tfvars

aws configure sso
# or however you configure your AWS credentials

# Add your profile name to enviroment
export AWS_PROFILE="my-aws-cli-profile-name"
# Windows:
# $Env:AWS_PROFILE = "my-aws-cli-profile-name"

terraform workspace select dev

terraform init

terraform plan
# With Doppler:
# doppler run --project terraform --config dev -- terraform plan
```

Alternatively to creating a `terraform.tfvars` file, you can export the same variables with the
[`TF_VAR_` prefix](https://developer.hashicorp.com/terraform/cli/config/environment-variables), for example:

```bash
export TF_VAR_FEIDE_CLIENT_ID=...
export TF_VAR_FEIDE_CLIENT_SECRET=...
export TF_VAR_DOPPLER_TOKEN_ALL=...
```
