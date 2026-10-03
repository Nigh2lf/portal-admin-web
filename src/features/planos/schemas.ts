import { z } from "zod";
import { decimalOpcional, inteiroNaoNegativo, slugObrigatorio } from "@/features/comum/schemas";

export const planoSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do plano."),
  slug: slugObrigatorio,
  monthly_price: decimalOpcional,
  property_limit: inteiroNaoNegativo(),
  photo_limit: inteiroNaoNegativo(),
  featured_limit: inteiroNaoNegativo(),
  has_realtor_page: z.boolean(),
  receives_property_requests: z.boolean(),
  has_hotsite: z.boolean(),
  is_owner_only: z.boolean(),
  is_recommended: z.boolean(),
  is_active: z.boolean(),
  sort_order: inteiroNaoNegativo(),
});

export type PlanoForm = z.infer<typeof planoSchema>;
