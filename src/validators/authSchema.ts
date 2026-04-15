import { z } from "zod";

const emailSchema = z
  .string({ error: "Email is required" })
  .trim()
  .min(1, { error: "Email is required" })
  .pipe(z.email({ error: "Please enter a valid email address" }));

const passwordSchema = z
  .string({ error: "Password is required" })
  .min(1, { error: "Password is required" });

const nameSchema = z
  .string({ error: "Name is required" })
  .trim()
  .min(1, { error: "Name is required" });

const loginParamReqSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const registerParamReqSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export { loginParamReqSchema, registerParamReqSchema };
