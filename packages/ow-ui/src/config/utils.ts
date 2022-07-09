// @ts-nocheck
export const utils = {
  // Margins
  m: (value) => ({
    margin: value,
  }),
  mt: (value) => ({
    marginTop: value,
  }),
  mr: (value) => ({
    marginRight: value,
  }),
  mb: (value) => ({
    marginBottom: value,
  }),
  ml: (value) => ({
    marginLeft: value,
  }),
  mx: (value) => ({
    marginLeft: value,
    marginRight: value,
  }),
  my: (value) => ({
    marginTop: value,
    marginBottom: value,
  }),
  // Paddings
  p: (value) => ({
    padding: value,
  }),
  pt: (value) => ({
    paddingTop: value,
  }),
  pr: (value) => ({
    paddingRight: value,
  }),
  pb: (value) => ({
    paddingBottom: value,
  }),
  pl: (value) => ({
    paddingLeft: value,
  }),
  px: (value) => ({
    paddingLeft: value,
    paddingRight: value,
  }),
  py: (value) => ({
    paddingTop: value,
    paddingBottom: value,
  }),
  bg: (value) => ({
    backgroundColor: value,
  }),
  fullWidth: (value) => {
    return value === true
      ? {
          width: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
        }
      : {}
  },
}
