# Terraform Module AWS Lightsail Certificate

This module creates a Lightsail certificate. This module is needed, because the certificate has to be set up before we
can create any Route53 records (due to Terraform not knowing the length of DVOs).
