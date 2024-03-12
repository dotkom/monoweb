const base = "https://datatracker.ietf.org/doc/html/rfc9110#name"

export const successResponse = {
  Ok: {
    code: 200,
    title: "OK",
    type: `${base}-200-ok`,
  },
  Created: {
    code: 201,
    title: "Created",
    type: `${base}-201-created`,
  },
  Accepted: {
    code: 202,
    title: "Accepted",
    type: `${base}-202-accepted`,
  },
  NoContent: {
    code: 204,
    title: "No Content",
    type: `${base}-204-no-content`,
  },
}

export const redirectResponse = {
  MultipleChoices: {
    code: 300,
    title: "Multiple Choices",
    type: `${base}-300-multiple-choices`,
  },
  MovedPermanently: {
    code: 301,
    title: "Moved Permanently",
    type: `${base}-301-moved-permanently`,
  },
  Found: {
    code: 302,
    title: "Found",
    type: `${base}-302-found`,
  },
  NotModified: {
    code: 304,
    title: "Not Modified",
    type: `${base}-304-not-modified`,
  },
  TemporaryRedirect: {
    code: 307,
    title: "Temporary Redirect",
    type: `${base}-307-temporary-redirect`,
  },
  PermanentRedirect: {
    code: 308,
    title: "Permanent Redirect",
    type: `${base}-308-permanent-redirect`,
  },
}
export const clientErrorResponse = {
  BadRequest: {
    code: 400,
    title: "Bad Request",
    type: `${base}-400-bad-request`,
  },
  Unauthorized: {
    code: 401,
    title: "Unauthorized",
    type: `${base}-401-unauthorized`,
  },
  PaymentRequired: {
    code: 402,
    title: "Payment Required",
    type: `${base}-402-payment-required`,
  },
  Forbidden: {
    code: 403,
    title: "Forbidden",
    type: `${base}-403-forbidden`,
  },
  NotFound: {
    code: 404,
    title: "Not Found",
    type: `${base}-404-not-found`,
  },
  MethodNotAllowed: {
    code: 405,
    title: "Method Not Allowed",
    type: `${base}-405-method-not-allowed`,
  },
  NotAcceptable: {
    code: 406,
    title: "Not Acceptable",
    type: `${base}-406-not-acceptable`,
  },
  ProxyAuthenticationRequired: {
    code: 407,
    title: "Proxy Authentication Required",
    type: `${base}-407-proxy-authentication-required`,
  },
  RequestTimeout: {
    code: 408,
    title: "Request Timeout",
    type: `${base}-408-request-timeout`,
  },
  Conflict: {
    code: 409,
    title: "Conflict",
    type: `${base}-409-conflict`,
  },
  Gone: {
    code: 410,
    title: "Gone",
    type: `${base}-410-gone`,
  },
  LengthRequired: {
    code: 411,
    title: "Length Required",
    type: `${base}-411-length-required`,
  },
  PreconditionFailed: {
    code: 412,
    title: "Precondition Failed",
    type: `${base}-412-precondition-failed`,
  },
  ContentTooLarge: {
    code: 413,
    title: "Content Too Large",
    type: `${base}-413-content-too-large`,
  },
  URITooLong: {
    code: 414,
    title: "URI Too Long",
    type: `${base}-414-uri-too-long`,
  },
  UnsupportedMediaType: {
    code: 415,
    title: "Unsupported Media Type",
    type: `${base}-415-unsupported-media-type`,
  },
  RangeNotSatisfiable: {
    code: 416,
    title: "Range Not Satisfiable",
    type: `${base}-416-range-not-satisfiable`,
  },
  ExpectationFailed: {
    code: 417,
    title: "Expectation Failed",
    type: `${base}-417-expectation-failed`,
  },
  Unused: {
    code: 418,
    title: "Unused",
    type: `${base}-418-unused`,
  },
  MisdirectedRequest: {
    code: 421,
    title: "Misdirected Request",
    type: `${base}-421-misdirected-request`,
  },
  UnprocessableContent: {
    code: 422,
    title: "Unprocessable Content",
    type: `${base}-422-unprocessable-content`,
  },
  UpgradeRequired: {
    code: 426,
    title: "Upgrade Required",
    type: `${base}-426-upgrade-required`,
  },
}

export const serverErrorResponse = {
  InternalServerError: {
    code: 500,
    title: "Internal Server Error",
    type: `${base}-500-internal-server-error`,
  },
  NotImplemented: {
    code: 501,
    title: "Not Implemented",
    type: `${base}-501-not-implemented`,
  },
  BadGateway: {
    code: 502,
    title: "Bad Gateway",
    type: `${base}-502-bad-gateway`,
  },
  ServiceUnavailable: {
    code: 503,
    title: "Service Unavailable",
    type: `${base}-503-service-unavailable`,
  },
  GatewayTimeout: {
    code: 504,
    title: "Gateway Timeout",
    type: `${base}-504-gateway-timeout`,
  },
  HTTPVersionNotSupported: {
    code: 505,
    title: "HTTP Version Not Supported",
    type: `${base}-505-http-version-not-supported`,
  },
  VariantAlsoNegotiates: {
    code: 506,
    title: "Variant Also Negotiates",
    type: `${base}-506-variant-also-negotiates`,
  },
  InsufficientStorage: {
    code: 507,
    title: "Insufficient Storage",
    type: `${base}-507-insufficient-storage`,
  },
  LoopDetected: {
    code: 508,
    title: "Loop Detected",
    type: `${base}-508-loop-detected`,
  },
  NotExtended: {
    code: 510,
    title: "Not Extended",
    type: `${base}-510-not-extended`,
  },
  NetworkAuthenticationRequired: {
    code: 511,
    title: "Network Authentication Required",
    type: `${base}-511-network-authentication-required`,
  },
}
