package com.financas.Services;

import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.financas.Entity.ChatMessage;
import com.financas.Entity.Despesa;
import com.financas.Entity.Usuario;
import com.financas.Repository.ChatMessageRepository;
import com.financas.Repository.DespesasRepository;

@Service
public class ChatService {

    private final GeminiService geminiService;
    private final ChatMessageRepository chatMessageRepository;
    private final DespesasRepository despesasRepository;

    public ChatService(
            GeminiService geminiService,
            ChatMessageRepository chatMessageRepository,
            DespesasRepository despesasRepository) {
        this.geminiService = geminiService;
        this.chatMessageRepository = chatMessageRepository;
        this.despesasRepository = despesasRepository;
    }

    public String processarMensagem(Usuario usuario, String mensagemUsuario) {
        if (mensagemUsuario == null || mensagemUsuario.isBlank()) {
            return "Digite uma pergunta sobre seus gastos para eu poder ajudar.";
        }

        String promptCompleto = montarPrompt(usuario, mensagemUsuario);
        String respostaGemini = geminiService.enviarMensagem(promptCompleto);

        ChatMessage mensagem = new ChatMessage();
        mensagem.setUsuarioId(usuario);
        mensagem.setMensagemUsuario(mensagemUsuario);
        mensagem.setMensagemBot(respostaGemini);
        mensagem.setDatahora(LocalDateTime.now());

        chatMessageRepository.save(mensagem);

        return respostaGemini;
    }

    private String montarPrompt(Usuario usuario, String mensagemUsuario) {
        YearMonth mesAtual = YearMonth.now();
        YearMonth mesAnterior = mesAtual.minusMonths(1);

        List<Despesa> despesas = despesasRepository.findByUsuarioAndDataBetweenOrderByDataDesc(
                usuario,
                mesAnterior.atDay(1),
                mesAtual.atEndOfMonth());

        List<Despesa> despesasMesAtual = despesas.stream()
                .filter(despesa -> YearMonth.from(despesa.getData()).equals(mesAtual))
                .toList();
        List<Despesa> despesasMesAnterior = despesas.stream()
                .filter(despesa -> YearMonth.from(despesa.getData()).equals(mesAnterior))
                .toList();

        double totalAtual = somar(despesasMesAtual);
        double totalAnterior = somar(despesasMesAnterior);
        double diferenca = totalAtual - totalAnterior;

        StringBuilder prompt = new StringBuilder();
        prompt.append("Voce e o mentor financeiro do sistema Financas.\n")
                .append("Seu objetivo e ajudar o usuario a controlar gastos, economizar e refletir se gastos extras eram necessarios.\n")
                .append("Se a pergunta nao for sobre financas, gastos, economia, orcamento, renda, dividas ou planejamento financeiro, responda exatamente: ")
                .append("'Desculpe, meu foco e ajudar voce a cuidar do seu dinheiro!'.\n")
                .append("Use apenas os dados fornecidos. Nao invente transacoes, renda, saldo ou metas.\n")
                .append("Seja educado, curto e direto. Responda em portugues do Brasil.\n")
                .append("Quando houver aumento de gastos, compare com o mes anterior, destaque categorias que subiram e faca perguntas praticas sobre necessidade.\n\n")
                .append("Data de hoje: ").append(LocalDate.now()).append("\n")
                .append("Usuario: ").append(usuario.getEmail()).append("\n")
                .append("Pergunta do usuario: ").append(mensagemUsuario).append("\n\n")
                .append("Resumo financeiro:\n")
                .append("- Total do mes atual (").append(mesAtual).append("): ").append(formatarMoeda(totalAtual)).append("\n")
                .append("- Total do mes anterior (").append(mesAnterior).append("): ").append(formatarMoeda(totalAnterior)).append("\n")
                .append("- Diferenca: ").append(formatarMoeda(diferenca)).append("\n")
                .append("- Comparacao: ").append(formatarPercentual(totalAtual, totalAnterior)).append("\n\n")
                .append("Gastos por categoria no mes atual:\n")
                .append(resumoPorCategoria(despesasMesAtual))
                .append("\nGastos por categoria no mes anterior:\n")
                .append(resumoPorCategoria(despesasMesAnterior))
                .append("\nCategorias com aumento no mes atual:\n")
                .append(categoriasComAumento(despesasMesAtual, despesasMesAnterior))
                .append("\nMaiores gastos recentes:\n")
                .append(maioresGastos(despesas));

        return prompt.toString();
    }

    private double somar(List<Despesa> despesas) {
        return despesas.stream().mapToDouble(Despesa::getValor).sum();
    }

    private String resumoPorCategoria(List<Despesa> despesas) {
        if (despesas.isEmpty()) {
            return "- Nenhum gasto registrado.\n";
        }

        return totaisPorCategoria(despesas).entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(entry -> "- " + entry.getKey() + ": " + formatarMoeda(entry.getValue()))
                .collect(Collectors.joining("\n", "", "\n"));
    }

    private String categoriasComAumento(List<Despesa> despesasMesAtual, List<Despesa> despesasMesAnterior) {
        Map<String, Double> atual = totaisPorCategoria(despesasMesAtual);
        Map<String, Double> anterior = totaisPorCategoria(despesasMesAnterior);

        String resultado = atual.entrySet().stream()
                .map(entry -> {
                    double totalAnterior = anterior.getOrDefault(entry.getKey(), 0.0);
                    double aumento = entry.getValue() - totalAnterior;
                    return Map.entry(entry.getKey(), aumento);
                })
                .filter(entry -> entry.getValue() > 0)
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(entry -> "- " + entry.getKey() + ": +" + formatarMoeda(entry.getValue()))
                .collect(Collectors.joining("\n"));

        if (resultado.isBlank()) {
            return "- Nenhuma categoria aumentou em relacao ao mes anterior.\n";
        }

        return resultado + "\n";
    }

    private Map<String, Double> totaisPorCategoria(List<Despesa> despesas) {
        Map<String, Double> totais = despesas.stream()
                .collect(Collectors.groupingBy(
                        despesa -> despesa.getCategoria().getNome(),
                        Collectors.summingDouble(Despesa::getValor)));
        return totais;
    }

    private String maioresGastos(List<Despesa> despesas) {
        if (despesas.isEmpty()) {
            return "- Nenhum gasto registrado nos ultimos dois meses.\n";
        }

        return despesas.stream()
                .sorted(Comparator.comparingDouble(Despesa::getValor).reversed())
                .limit(5)
                .map(despesa -> "- "
                        + despesa.getNome()
                        + " | "
                        + despesa.getCategoria().getNome()
                        + " | "
                        + formatarMoeda(despesa.getValor())
                        + " | "
                        + despesa.getData())
                .collect(Collectors.joining("\n", "", "\n"));
    }

    private String formatarMoeda(double valor) {
        return NumberFormat.getCurrencyInstance(Locale.of("pt", "BR")).format(valor);
    }

    private String formatarPercentual(double totalAtual, double totalAnterior) {
        if (totalAnterior == 0 && totalAtual == 0) {
            return "sem gastos nos dois meses";
        }
        if (totalAnterior == 0) {
            return "houve gastos neste mes, mas nao havia gastos no mes anterior";
        }

        double percentual = ((totalAtual - totalAnterior) / totalAnterior) * 100;
        return String.format(Locale.of("pt", "BR"), "%.1f%% em relacao ao mes anterior", percentual);
    }
}
