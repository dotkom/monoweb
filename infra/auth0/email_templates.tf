locals {
  web_origin = {
    "dev" = "http://localhost:3000"
    "stg" = "https://dev.online.ntnu.no"
    "prd" = "https://online.ntnu.no"
  }[terraform.workspace]
}

resource "auth0_email_template" "verify_email" {
  depends_on = [auth0_email_provider.amazon_ses_email_provider]

  template                = "verify_email"
  enabled                 = true
  from                    = "Linjeforeningen Online <online@online.ntnu.no>"
  subject                 = "(Online) Bekreft e-postadressen din"
  syntax                  = "liquid"
  result_url              = "${local.web_origin}/innstillinger/bruker?email_verified=1"
  url_lifetime_in_seconds = 86400 # 24 hours

  body = <<-EOT
    <!DOCTYPE html>
    <html dir="ltr" lang="nb">
      <head>
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>
        <meta name="x-apple-disable-message-reformatting"/>
      </head>
      <body style="background-color: rgb(255, 255, 255);">
        <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 37.5em">
          <tbody>
            <tr style="width: 100%">
              <td>
                <h2>Bekreft e-postadressen din</h2>
                <p>Hei, {{ user.name | default: user.email | split: " " | first }}. Klikk på lenken under for å bekrefte e-postadressen din hos Linjeforeningen Online.</p>
              </td>
            </tr>

            <tr style="width: 100%">
              <td>
                <a href="{{ url }}">Bekreft e-postadressen min</a>
                <p style="font-size: 0.75em; color: gray">Lenken er gyldig i 24 timer. Dersom du ikke ba om denne e-posten, kan du trygt ignorere den.</p>
              </td>
            </tr>

            <tr style="width: 100%">
              <td>
                <h3 style="font-size: 0.9em; margin-top: 3rem">Linjeforeningen Online</h3>
                <p style="font-size: 0.75em; color: gray">Du mottar denne e-posten fordi noen har bedt om å bekrefte denne e-postadressen hos Online.</p>
                <p style="font-size: 0.75em; color: gray">Org. Nr. 992 548 045 &ndash; Høgskoleringen 5, 7034 Trondheim</p>
                <p style="font-size: 0.75em; color: gray">Alle datoer er i norsk tid.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  EOT
}
