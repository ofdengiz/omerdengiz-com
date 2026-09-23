# ------------------------------------------------------------------
# Lambda@Edge: pretty URLs + security headers
#
# Lambda@Edge functions MUST live in us-east-1 regardless of where
# CloudFront is "deployed" from. The same function code is attached to
# two CloudFront events: viewer-request and viewer-response.
# ------------------------------------------------------------------

data "archive_file" "edge_zip" {
  type        = "zip"
  source_file = "${path.module}/../lambda-edge/index.js"
  output_path = "${path.module}/.build/lambda-edge.zip"
}

data "aws_iam_policy_document" "edge_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = [
        "lambda.amazonaws.com",
        "edgelambda.amazonaws.com",
      ]
    }
  }
}

resource "aws_iam_role" "edge" {
  name               = "${var.project}-edge-role"
  assume_role_policy = data.aws_iam_policy_document.edge_assume.json
}

resource "aws_iam_role_policy_attachment" "edge_basic" {
  role       = aws_iam_role.edge.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "edge" {
  provider         = aws.us_east_1
  function_name    = "${var.project}-edge"
  role             = aws_iam_role.edge.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = data.archive_file.edge_zip.output_path
  source_code_hash = data.archive_file.edge_zip.output_base64sha256
  memory_size      = 128
  timeout          = 5

  # Lambda@Edge cannot use environment variables or VPC config.
  publish = true
}
