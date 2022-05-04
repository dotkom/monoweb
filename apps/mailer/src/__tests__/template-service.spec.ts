import { initTemplateService } from "../template-service"
import { BaseTemplateProps } from "../templates/base"

describe("TemplateService", () => {
  const templateService = initTemplateService()

  it("should interpolate the properties into the template", () => {
    const props: BaseTemplateProps = { body: "Hello world" }
    const template = templateService.render("base", props)
    expect(template).toMatchSnapshot()
  })
})
