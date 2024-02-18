resource "auth0_log_stream" "aws" {
  name   = "AWS Eventbridge"
  type   = "eventbridge"
  status = "active"

  sink {
    aws_account_id = data.aws_caller_identity.current.account_id
    aws_region     = data.aws_region.current.name
  }
}

resource "aws_cloudwatch_event_bus" "messenger" {
  name              = auth0_log_stream.aws.sink[0].aws_partner_event_source
  event_source_name = auth0_log_stream.aws.sink[0].aws_partner_event_source
}

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_target#cloudwatch-log-group-usage
resource "aws_cloudwatch_log_group" "log_storage" {
  name              = "auth0-logs-${terraform.workspace}"
  retention_in_days = 180
}


data "aws_iam_policy_document" "auth0_log_policy" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogStream"
    ]

    resources = [
      "${aws_cloudwatch_log_group.log_storage.arn}:*"
    ]

    principals {
      type = "Service"
      identifiers = [
        "delivery.logs.amazonaws.com",
        "events.amazonaws.com",
      ]
    }
  }
  statement {
    effect = "Allow"
    actions = [
      "logs:PutLogEvents"
    ]

    resources = [
      "${aws_cloudwatch_log_group.log_storage.arn}:*:*"
    ]

    principals {
      type = "Service"
      identifiers = [
        "delivery.logs.amazonaws.com",
        "events.amazonaws.com",
      ]
    }

    condition {
      test     = "ArnEquals"
      values   = [aws_cloudwatch_event_rule.auth0.arn]
      variable = "aws:SourceArn"
    }
  }
}

resource "aws_cloudwatch_log_resource_policy" "auth0" {
  policy_document = data.aws_iam_policy_document.auth0_log_policy.json
  policy_name     = "auth0-log-publishing-policy-${terraform.workspace}"
}

resource "aws_cloudwatch_event_rule" "auth0" {
  name           = "Auth0_event_rule_${terraform.workspace}"
  description    = "Auth0 logs forwarded to AWS"
  event_bus_name = aws_cloudwatch_event_bus.messenger.name

  # this essentially matches against the json
  # you can see an example payload in the auth0 admin-panel
  event_pattern = jsonencode({
    detail-type = ["Auth0 log"]
    account     = [data.aws_caller_identity.current.account_id]
    source      = [aws_cloudwatch_event_bus.messenger.name]
    # here we can filter out which event types we want to log
    # https://auth0.com/docs/deploy-monitor/logs/log-event-type-codes
    # detail = {
    #   data = {
    #     type = ["seacft"]
    #   }
    # }
  })
}


resource "aws_cloudwatch_event_target" "target" {
  arn            = aws_cloudwatch_log_group.log_storage.arn
  event_bus_name = aws_cloudwatch_event_bus.messenger.name
  rule           = aws_cloudwatch_event_rule.auth0.name
}
