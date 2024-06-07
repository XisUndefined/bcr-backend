import { z, ZodType } from "zod";

export default class OrderValidation {
  static readonly CREATE: ZodType = z
    .object({
      car_id: z.string().uuid(),
      bank: z.enum(["bca", "bni", "mandiri"], {
        errorMap: (issue, ctx) => {
          if (issue.code === z.ZodIssueCode.invalid_enum_value) {
            return {
              message: `Invalid value. Accepted values are: bca, bni, or mandiri`,
            };
          }
          return { message: ctx.defaultError };
        },
      }),
      start_rent: z
        .string()
        .datetime()
        .refine(
          (value) => {
            const startDate = new Date(value);
            const now = new Date();
            now.setDate(now.getDate() + 1);
            return startDate >= now;
          },
          { message: "Start date must be atleast 1 day after today's date" }
        ),
      finish_rent: z.string().datetime(),
    })
    .refine(
      (data) => {
        const startRent = new Date(data.start_rent);
        const finishRent = new Date(data.finish_rent);
        const sevenDaysLater = new Date(startRent);
        sevenDaysLater.setDate(startRent.getDate() + 7);
        return finishRent <= sevenDaysLater;
      },
      {
        message: "Finish rent date must be within 7 days of start rent date",
        path: ["finish_rent"],
      }
    )
    .refine(
      (data) => {
        const startRent = new Date(data.start_rent);
        const finishRent = new Date(data.finish_rent);
        return finishRent > startRent;
      },
      {
        message: "Finish rent date must not be before the start rent date",
        path: ["finish_rent"],
      }
    );

  static readonly STATUS_UPDATE: ZodType = z.object({
    body: z
      .object({
        status: z.enum(["approved", "rejected", "completed"], {
          errorMap: (issue, ctx) => {
            if (issue.code === z.ZodIssueCode.invalid_enum_value) {
              return {
                message: `Invalid value. Accepted values are: approved, rejected, or completed`,
              };
            }
            return { message: ctx.defaultError };
          },
        }),
      })
      .strict(),
  });

  static readonly FILE_UPDATE: ZodType = z
    .object({
      file: z.object({
        fieldname: z.literal("slip"),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string().refine((value) => value.startsWith("image/"), {
          message: "Invalid file type. Only images are allowed.",
        }),
        buffer: z.instanceof(Buffer),
        size: z.number().max(5 * 1024 * 1024, {
          message: "File size should be less than 5MB",
        }),
      }),
    })
    .refine((data) => data.file !== undefined, {
      message:
        "Transfer slip input field is required. Please upload your transfer slip",
      path: ["file"],
    });
}
