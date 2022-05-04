import { type Template } from "../template-service"

export type BaseTemplateProps = {
  body: string
}

export const template: Template<BaseTemplateProps> = (props) => `
<table width="100%" cellpadding="0" cellspacing="0" align="center">
  <tr>
    <td width="100%" align="center">
      <!-- Main content -->
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFF; padding-bottom: 20px;" align="center">
        <tr>
          <td>
            ${props.body}
          </td>
        </tr>
      </table>
        <!-- Footer -->
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #000; color: #FFF;" align="center">
        <tr style="height: 30px;">
          <td align="center">
            <img style="margin-top: 5px;" width="220" src="https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/wiki/attachments/70/52fda8303327a69819bc245931869b51/Online_hvit.png" />
          </td>
        </tr>
        <tr>
          <td>
            <p style="font-size: 13px; font-family: sans-serif; text-align: center;">Linjeforeningen Online (OrgNr 992 548 04), Sem Sælands vei 9, 7491 Trondheim</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`
