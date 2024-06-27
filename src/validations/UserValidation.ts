import { z, ZodType } from "zod";

const userSchema = z.object({
  firstname: z.string().max(50).trim(),
  lastname: z
    .string()
    .max(50)
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  email: z.string().trim().toLowerCase().email(),
  avatar: z.string().trim().optional(),
});

const fileSchema = z
  .object({
    fieldname: z.literal("avatar"),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string().refine((value) => value.startsWith("image/"), {
      message: "Invalid file type. Only images are allowed.",
    }),
    buffer: z.instanceof(Buffer),
    size: z.number().max(5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    }),
  })
  .optional();

export class UserValidation {
  static readonly SIGNUP: ZodType = userSchema
    .extend({
      password: z
        .string()
        .min(8)
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(
          /[\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\.\>\/\?\|\\]/,
          "Password must contain at least one special character"
        ),
      confirmPassword: z.string(),
    })
    .strict()
    .refine((data) => data.password === data.confirmPassword, {
      message: "Confirm password does not match",
      path: ["confirmPassword"],
    })
    .transform(({ confirmPassword, lastname, ...rest }) => {
      if (lastname === undefined) {
        return rest;
      } else {
        return { lastname, ...rest };
      }
    });

  static readonly UPDATE: ZodType = z.object({
    body: z.object({
      firstname: userSchema.shape.firstname.optional(),
      lastname: userSchema.shape.lastname,
      email: userSchema.shape.email.optional(),
      password_input: z
        .object({
          oldPassword: z.string().min(8),
          newPassword: z
            .string()
            .min(8)
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(
              /[A-Z]/,
              "Password must contain at least one uppercase letter"
            )
            .regex(
              /[a-z]/,
              "Password must contain at least one lowercase letter"
            )
            .regex(
              /[\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\.\>\/\?\|\\]/,
              "Password must contain at least one special character"
            ),
          confirmPassword: z.string(),
        })
        .refine((data) => data!.newPassword === data!.confirmPassword, {
          message: "Confirm password does not match",
          path: ["confirmPassword"],
        })
        .optional(),
    }),
    file: fileSchema,
  });

  static readonly LOGIN: ZodType = z
    .object({
      email: z.string().trim().toLowerCase().email(),
      password: z.string(),
    })
    .strict();
}
