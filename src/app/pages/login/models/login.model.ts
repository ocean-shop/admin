export type LoginData = {
  identity: string;
};

export type OtpData = {
  otp: string;
};

/** Who the OTP is for: the API takes either an email or a phone. */
export type OtpIdentityPayload = {
  email?: string;
  phone?: string;
};

export type OtpVerifyPayload = OtpIdentityPayload & {
  code: string;
};

export type OtpRequestResponse = {
  message: string;
};
