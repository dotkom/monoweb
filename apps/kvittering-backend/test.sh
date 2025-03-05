curl -i -X POST \
  'https://j5bjoshwu5.execute-api.eu-north-1.amazonaws.com/prod/upload' \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:3000' \
  -d '{
    "image": "'$(base64 -i /Users/skog/h/code/personlig-okonomi/regnskap/upload-receipts/lambda/cat2.jpg)'"
  }'
