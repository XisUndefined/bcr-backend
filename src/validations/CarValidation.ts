import { z, ZodType } from "zod";

const plateRegex =
  /^(A|B|D|F|T|Z|E|H|G|K|R|AB|AD|AE|AG|S|K|W|L|M|N|P|BL|BB|BK|BA|BM|BH|BG|BN|BE|BD|B|DA|KT|DB|DL|DM|DN|DT|DD|DC|DS|DE|DG|DH|EB|ED|EA|PA|PB)\s([0-9]{1,4})\s([A-Z]{1,3})$/;

const carBaseSchema = z.object({
  plate: z.string().refine((value) => plateRegex.test(value), {
    message: "Invalid car plate number",
  }),
  transmission: z.string(),
  name: z.string().max(50),
  year: z.number().positive(),
  driver_service: z.boolean(),
  rent_per_day: z.number().positive(),
  capacity: z.number().min(1).max(10),
  category: z.enum(["small", "medium", "large"], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return {
          message: `Invalid value. Accepted values are: small, medium, or large`,
        };
      }
      return { message: ctx.defaultError };
    },
  }),
  description: z.string(),
});

const fileSchema = z
  .object({
    fieldname: z.literal("car"),
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

export default class CarValidation {
  static readonly INPUT: ZodType = z.object({
    body: carBaseSchema,
    file: fileSchema,
  });

  static readonly CATEGORY: ZodType = z.object({
    category: carBaseSchema.shape.category.optional(),
    sort: z.string().optional(),
    page: z.number().positive(),
    size: z.number().positive(),
  });

  static readonly SEARCH: ZodType = z.object({
    start_date: z.string().datetime("Invalid date or time"),
    finish_date: z.string().datetime("Invalid date or time"),
    driver_service: z.boolean(),
    capacity: z.number().min(1).max(10).optional(),
    sort: z.string().optional(),
    page: z.number().positive(),
    size: z.number().positive(),
  });
}
