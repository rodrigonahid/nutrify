# Plano de Onboarding — Nutrify

> Documento de produto. Descreve o fluxo de entrada de novos nutricionistas na plataforma: o que já existe, o que precisa ser construído e como medir sucesso.

---

## 1. Contexto e Objetivo

O onboarding do Nutrify tem um único público primário: o **nutricionista (profissional)**. Ele é quem contrata o serviço, convida os pacientes e gera valor na plataforma. O paciente é um usuário secundário — ele só entra porque o nutricionista convida.

**Objetivo do onboarding:**
> Levar o nutricionista ao seu primeiro "momento de valor real" o mais rápido possível.

**O que é o momento de valor real:**  
O nutricionista tem pelo menos um paciente cadastrado e um registro de progresso criado. A partir daí, ele enxerga concretamente o que a plataforma faz.

**Métricas de sucesso:**
| Métrica | Meta |
|---|---|
| Taxa de conclusão do perfil (após cadastro) | > 70% |
| Tempo até o primeiro paciente convidado | < 10 min |
| Taxa de ativação (paciente aceita o convite) | > 60% em 7 dias |
| Tempo até o primeiro registro de progresso | < 24 h após paciente ativo |
| Retenção D7 (nutricionista volta em 7 dias) | > 50% |

---

## 2. Visão Geral do Fluxo

```
Landing Page
    │
    ▼
[1] Cadastro do nutricionista
    │
    ▼
[2] Configuração do perfil
    │
    ▼
[3] Primeiro convite de paciente
    │
    ▼
[4] Paciente aceita e se cadastra
    │
    ▼
[5] Primeiro registro de progresso
    │
    ▼
    Nutricionista ativado ✓
```

---

## 3. Fases Detalhadas

---

### Fase 1 — Cadastro do Nutricionista

**Status atual:** ⚠️ Parcialmente implementado  
O único meio de criar um profissional hoje é via CLI (`npm run create:professional`), executado por um admin. Não existe formulário de cadastro self-service.

**O que precisa ser construído:**
- Página `/cadastro` (ou `/signup/professional`) com formulário público
- API route `POST /api/auth/signup/professional`
- Campos mínimos para o cadastro inicial:
  - Nome completo
  - E-mail
  - Senha + confirmação
  - CRN (Conselho Regional de Nutrição) — opcional no cadastro, obrigatório depois
- Validação de e-mail único
- Criação do `user` com `role: "professional"` + registro na tabela `professionals`
- Sessão criada automaticamente após o cadastro (login automático)
- Redirecionamento para `/professional` com flag de "novo usuário"

**Campos da tabela `professionals` relevantes:**
```
name, phone, professionalLicense (CRN), specialization, bio, logoUrl, avatarUrl
```

**UX:**
- O formulário de cadastro deve ser simples — pedir apenas e-mail, nome e senha
- Os demais campos (CRN, especialização, bio) são coletados na Fase 2
- Mostrar indicador de senha forte
- Não exigir cartão de crédito

---

### Fase 2 — Configuração do Perfil

**Status atual:** ✅ Implementado  
A página `/professional/settings` já permite editar todos os campos do perfil, incluindo avatar e logo.

**O que falta:**
- Um "gatilho de onboarding" que leva o nutricionista até as configurações logo após o cadastro
- Um indicador de completude do perfil (ex: "Seu perfil está 40% completo")
- A página de settings já existe — só precisa de contexto de entrada no primeiro acesso

**Campos que compõem um perfil completo:**
| Campo | Obrigatório para funcionar? |
|---|---|
| Nome | Sim — aparece no dashboard |
| Especialização | Não — mas aumenta confiança do paciente |
| CRN | Não — mas é importante para credibilidade |
| Bio | Não |
| Avatar | Não — mas humaniza a plataforma |
| Logo | Não — para uso em planos alimentares |
| Telefone | Não |

**UX sugerida para o primeiro acesso:**
- Banner no dashboard: *"Complete seu perfil para uma experiência mais profissional"* com link para `/professional/settings`
- Ou: modal de boas-vindas com checklist de 3 passos rápidos

---

### Fase 3 — Primeiro Convite de Paciente

**Status atual:** ✅ Implementado  
O sistema de códigos de convite está completo. O nutricionista gera um código de 8 dígitos com validade de 30 dias, associado ao nome do paciente.

**Fluxo atual:**
1. Nutricionista acessa `/professional/patients`
2. Gera um código via interface (ou via API `POST /api/professional/invite-codes`)
3. Copia o código e envia manualmente para o paciente (WhatsApp, e-mail, etc.)

**O que falta / pontos de fricção:**
- Não existe notificação automática — o compartilhamento é 100% manual
- Nenhum estado de "aguardando ativação" visível para o nutricionista
- Sem lembrete se o paciente não usar o código em X dias
- Sem forma de reenviar ou estender a validade do código

**Melhorias recomendadas para onboarding:**
- Botão de "Copiar link de convite" que gera uma URL com o código embutido (ex: `nutrify.com/entrar?codigo=ABCD1234`)
- Opção de compartilhar via WhatsApp (link `wa.me` com mensagem pré-formatada)
- Status visível na lista de pacientes: `Convite enviado`, `Aguardando`, `Ativo`

**Mensagem sugerida para compartilhamento via WhatsApp:**
```
Olá, [nome do paciente]! 🥗

Estou usando o Nutrify para acompanhar sua evolução de forma mais organizada.

Acesse o link abaixo e crie sua conta usando o código de convite:
👉 nutrify.com/entrar?codigo=[CÓDIGO]

O código é válido por 30 dias. Qualquer dúvida, me avise!
```

---

### Fase 4 — Paciente Aceita o Convite

**Status atual:** ✅ Implementado  
O fluxo de cadastro do paciente via código existe e funciona em 3 etapas:

1. **Passo 1:** Inserir o código de 8 dígitos → valida e mostra o nome do paciente
2. **Passo 2:** Dados pessoais (nome, data de nascimento)
3. **Passo 3:** Criar conta (e-mail, senha, confirmação)

**Validações implementadas:**
- Código existe e não foi usado
- Código não expirou
- E-mail único no sistema
- Senha com confirmação

**O que falta:**
- Notificação para o nutricionista quando o paciente aceitar o convite
  - Push notification, e-mail ou badge no dashboard
- O paciente não recebe nenhuma orientação após o cadastro (empty state pobre)

---

### Fase 5 — Primeiro Registro de Progresso

**Status atual:** ✅ Implementado (com auto-save e rascunho)  
O fluxo de criação de progresso cria automaticamente um rascunho ao abrir o formulário, salva em tempo real via debounce (1.5s) e só publica quando o nutricionista clica em "Publicar registro".

**Fluxo atual:**
1. Nutricionista acessa `/professional/patients/[id]/progress`
2. Clica em "Adicionar"
3. Um rascunho é criado imediatamente no banco
4. Preenche as medidas — auto-salva conforme digita
5. Pode adicionar fotos (upload drag-and-drop)
6. Clica em "Publicar registro"

**Campos disponíveis para o primeiro registro:**
- Composição corporal: peso, altura, % gordura, IMC
- Perímetros: pescoço, tórax, cintura, quadril, braços, coxas, panturrilha
- Dobras cutâneas: 9 pontos
- Fotos antes/depois

**Sugestão para o onboarding:**
- No primeiro acesso à aba de progresso de um paciente, mostrar um tooltip ou modal explicando que as medidas são todas opcionais — preencha o que foi medido hoje
- Destacar que o IMC é calculado automaticamente se peso e altura forem inseridos

---

## 4. Checklist de Onboarding (Widget no Dashboard)

Para guiar o nutricionista pelos primeiros passos, sugerimos um widget persistente no dashboard (`/professional`) que desaparece assim que todos os itens forem concluídos.

**Itens do checklist:**

```
☐  Complete seu perfil (nome, especialização, CRN)
☐  Faça upload de uma foto de perfil
☐  Convide seu primeiro paciente
☐  Aguarde o paciente aceitar o convite
☐  Adicione o primeiro registro de progresso
```

**Comportamento:**
- Cada item é marcado automaticamente quando a ação correspondente é detectada
- O widget pode ser minimizado mas não descartado até 100% de conclusão
- Ao completar todos os itens: mensagem de parabéns + confete 🎉

**Estado de persistência sugerido:**
- Coluna `onboardingCompletedAt` na tabela `professionals` (nullable timestamp)
- Enquanto null → mostra o widget
- Após 100% → define o timestamp e oculta permanentemente

---

## 5. Estados Vazios com Orientação

Cada seção do app deve ter um empty state orientador para novos usuários — não apenas "Nenhum item encontrado".

| Seção | Empty State Sugerido |
|---|---|
| Lista de pacientes | *"Você ainda não tem pacientes. Gere um código de convite e compartilhe com seu primeiro paciente."* + botão "Convidar paciente" |
| Progresso do paciente | *"Nenhum registro ainda. Adicione o primeiro registro para começar a acompanhar a evolução."* + botão "Adicionar registro" |
| Agenda | *"Sem consultas agendadas. Adicione sua primeira consulta para começar a organizar sua agenda."* |
| Planos alimentares | *"Nenhum plano criado ainda. Crie o primeiro plano alimentar para este paciente."* |

---

## 6. O Que Precisa Ser Construído (Resumo)

| Item | Prioridade | Status |
|---|---|---|
| Formulário de cadastro self-service para nutricionistas | 🔴 Alta | ❌ Não existe |
| API de signup de profissionais | 🔴 Alta | ❌ Não existe |
| Widget de checklist de onboarding no dashboard | 🟡 Média | ❌ Não existe |
| Link/URL compartilhável com código embutido | 🟡 Média | ❌ Não existe |
| Notificação quando paciente aceita convite | 🟡 Média | ❌ Não existe |
| Botão "Compartilhar via WhatsApp" | 🟢 Baixa | ❌ Não existe |
| Indicador de completude do perfil | 🟢 Baixa | ❌ Não existe |
| E-mail de boas-vindas após cadastro | 🟢 Baixa | ❌ Não existe (sem sistema de e-mail) |
| Empty states orientadores | 🟡 Média | ⚠️ Parcial |
| Página de settings do profissional | — | ✅ Existe |
| Sistema de códigos de convite | — | ✅ Existe |
| Cadastro do paciente via código | — | ✅ Existe |
| Criação de registro de progresso com auto-save | — | ✅ Existe |
| Upload de fotos no progresso | — | ✅ Existe |

---

## 7. Sequência de Implementação Recomendada

Dado o estado atual, a ordem recomendada para desbloquear o onboarding completo é:

**Sprint 1 — Desbloqueio da entrada:**
1. Criar formulário de cadastro self-service (`/cadastro`)
2. Criar API route de signup de profissional
3. Redirecionar o CTA "Criar conta" da landing page para essa rota

**Sprint 2 — Guia pós-cadastro:**
1. Widget de checklist no dashboard
2. Coluna `onboardingCompletedAt` na tabela `professionals`
3. Melhorar empty states das seções principais

**Sprint 3 — Fricção no convite:**
1. URL compartilhável com código embutido
2. Botão "Copiar link" e "Enviar via WhatsApp"
3. Status do convite na lista de pacientes (Aguardando / Ativo)

---

*Última atualização: Abril 2026*
