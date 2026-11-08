import { z } from "zod";

export const activityHistoryQuery = z.object({
  device_id: z.string().trim().min(1),
  lang: z.enum(["vi", "en", "zh", "ko", "ja"]).default("vi"),
});
