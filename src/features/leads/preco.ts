import { formatarMoeda } from "@/lib/utils/format";

/** Faixa de preço em BRL para encomendas (`min_price`/`max_price` podem ser nulos). */
export function faixaDePreco(min: string | null, max: string | null) {
  if (!min && !max) return "—";
  if (min && max) return `${formatarMoeda(min)} a ${formatarMoeda(max)}`;
  return min ? `A partir de ${formatarMoeda(min)}` : `Até ${formatarMoeda(max)}`;
}
