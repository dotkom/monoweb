import Textarea from "./Textarea"

export default {
  title: "atoms/Textarea",
  component: Textarea,
}

export const DefaultWithPlaceholder = () => <Textarea placeholder="Enter something.." />
export const DisabledWithPlaceholder = () => <Textarea placeholder="Enter something.." disabled />

export const DefaultWithLabel = () => <Textarea placeholder="Enter something.." label="Comment" id="default" />
export const DisabledWithLabel = () => (
  <Textarea placeholder="Enter something.." label="Comment" disabled id="default" />
)

export const DefaultWithText = () => <Textarea value="Lorem ipsum dolor sit." readOnly />
export const DisabledWithText = () => <Textarea value="Lorem ipsum dolor sit." readOnly disabled />

export const DefaultWithDanger = () => (
  <Textarea
    label="Comment"
    value="The quick brown fox jumps over the lazy dog"
    readOnly
    status="danger"
    message="Failed to validate text"
  />
)

export const DefaultWithSuccess = () => (
  <Textarea
    label="Comment"
    value="The quick brown fox jumps over the lazy dog"
    readOnly
    status="success"
    message="Field validation successful"
  />
)
