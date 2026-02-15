# Translations — pt-BR

Strategy: no i18n library. All UI strings written directly in Portuguese.
Date format: `pt-BR` locale. Currency: already using `R$`.
Status legend: ⬜ Not started · ✅ Done

---

## Auth & Root

| File | Route | Status |
|------|-------|--------|
| `src/app/layout.tsx` | metadata | ⬜ |
| `src/app/login/page.tsx` | `/login` | ⬜ |
| `src/app/signup/page.tsx` | `/signup` | ⬜ |

**`layout.tsx`** — metadata only
- "Nutrition management for professionals" → "Gestão nutricional para profissionais"

**`login/page.tsx`**
- "Nutrition management for professionals" → "Gestão nutricional para profissionais"
- "Welcome back" → "Bem-vindo de volta"
- "Sign in to continue to your dashboard" → "Entre para acessar seu painel"
- "Email address" → "E-mail"
- "you@example.com" → "voce@exemplo.com"
- "Password" → "Senha"
- "Show password" / "Hide password" → "Mostrar senha" / "Ocultar senha"
- "Sign in" → "Entrar"
- "Password is required" → "Senha obrigatória"
- "Login failed" → "Falha no login"
- "An error occurred. Please try again." → "Ocorreu um erro. Tente novamente."
- "Don't have an account?" → "Não tem uma conta?"
- "Create account" → "Criar conta"

**`signup/page.tsx`**
- "Nutrition management for professionals" → "Gestão nutricional para profissionais"
- "Enter your code" → "Digite seu código"
- "Enter the 8-digit code from your nutritionist" → "Digite o código de 8 dígitos do seu nutricionista"
- "Invite code" → "Código de convite"
- "8-digit code provided by your nutritionist" → "Código de 8 dígitos fornecido pelo seu nutricionista"
- "Continue" → "Continuar"
- "Invite code is required" → "Código de convite obrigatório"
- "Invalid invite code" → "Código de convite inválido"
- "Failed to validate invite code. Please try again." → "Falha ao validar o código. Tente novamente."
- "Your information" → "Suas informações"
- "Confirm your personal details" → "Confirme seus dados pessoais"
- "Full name" → "Nome completo"
- "Jane Doe" → "Maria Silva"
- "Name is required" → "Nome obrigatório"
- "Name is too long" → "Nome muito longo"
- "Date of birth" → "Data de nascimento"
- "(optional)" → "(opcional)"
- "Your nutritionist: {email}" → "Seu nutricionista: {email}"
- "Create account" → "Criar conta"
- "Set up your login credentials" → "Configure suas credenciais de acesso"
- "Email address" → "E-mail"
- "Invalid email address" → "E-mail inválido"
- "Email is required" → "E-mail obrigatório"
- "Email is too long" → "E-mail muito longo"
- "At least 8 characters with uppercase, lowercase, and number" → "Mínimo 8 caracteres com maiúscula, minúscula e número"
- "Password is required" → "Senha obrigatória"
- "Password is too long" → "Senha muito longa"
- "Use 8+ chars with uppercase, lowercase, and a number" → "Use 8+ caracteres com maiúscula, minúscula e número"
- "Confirm password" → "Confirmar senha"
- "Please confirm your password" → "Confirme sua senha"
- "Passwords do not match" → "As senhas não coincidem"
- "Passwords match" → "Senhas iguais"
- "Back" → "Voltar"
- "Signup failed" → "Falha no cadastro"
- "Already have an account?" → "Já tem uma conta?"
- "Sign in" → "Entrar"

---

## Admin

| File | Route | Status |
|------|-------|--------|
| `src/app/admin/page.tsx` | `/admin` | ⬜ |
| `src/app/admin/professionals/page.tsx` | `/admin/professionals` | ⬜ |
| `src/app/admin/professionals/create/page.tsx` | `/admin/professionals/create` | ⬜ |

**`admin/page.tsx`**
- "Admin" → "Admin"
- "Platform management — {email}" → "Gestão da plataforma — {email}"
- "Nutritionists" → "Nutricionistas"
- "Manage nutritionist accounts" → "Gerenciar contas de nutricionistas"
- "Patients" → "Pacientes"
- "View all patients in the system" → "Ver todos os pacientes do sistema"
- "Statistics" → "Estatísticas"
- "Platform analytics and reports" → "Análises e relatórios da plataforma"

**`admin/professionals/page.tsx`**
- "← Back to Dashboard" → "← Voltar ao painel"
- "Professionals" → "Profissionais"
- "No professionals yet" → "Nenhum profissional ainda"
- "{count} professional(s)" → "{count} profissional(is)"
- "Create Professional" → "Criar profissional"
- "Create the first nutritionist account." → "Crie a primeira conta de nutricionista."
- "License: {license}" → "CRN: {license}"

**`admin/professionals/create/page.tsx`**
- "← Back to Professionals" → "← Voltar aos profissionais"
- "Create Professional Account" → "Criar conta de profissional"
- "Add a new nutritionist to the platform" → "Adicionar um novo nutricionista à plataforma"
- "Account Credentials" → "Credenciais da conta"
- "Email" → "E-mail"
- "professional@example.com" → "nutricionista@exemplo.com"
- "Password" → "Senha"
- "At least 8 characters with uppercase, lowercase, and number" → "Mínimo 8 caracteres com maiúscula, minúscula e número"
- "Confirm Password" → "Confirmar senha"
- "Professional Information (Optional)" → "Informações profissionais (opcional)"
- "Professional License" → "Registro profissional (CRN)"
- "License number" → "Número do registro"
- "Specialization" → "Especialização"
- "e.g., Sports Nutrition, Weight Management" → "ex.: Nutrição Esportiva, Emagrecimento"
- "Maximum 255 characters" → "Máximo 255 caracteres"
- "Bio" → "Bio"
- "Brief professional biography…" → "Breve biografia profissional…"
- "Maximum 2000 characters" → "Máximo 2000 caracteres"
- "Creating…" / "Create Professional" → "Criando…" / "Criar profissional"
- "Cancel" → "Cancelar"
- "Failed to create professional" → "Falha ao criar profissional"
- "Passwords do not match" → "As senhas não coincidem"
- "An error occurred. Please try again." → "Ocorreu um erro. Tente novamente."

---

## Professional

| File | Route | Status |
|------|-------|--------|
| `src/app/professional/page.tsx` | `/professional` | ⬜ |
| `src/app/professional/patients/page.tsx` | `/professional/patients` | ⬜ |
| `src/app/professional/patients/[patientId]/page.tsx` | `/professional/patients/[id]` | ⬜ |
| `src/app/professional/patients/[patientId]/plan/page.tsx` | `/professional/patients/[id]/plan` | ⬜ |
| `src/app/professional/patients/[patientId]/progress/page.tsx` | `/professional/patients/[id]/progress` | ⬜ |
| `src/app/professional/patients/[patientId]/progress/[progressId]/page.tsx` | `/professional/patients/[id]/progress/[id]` | ⬜ |
| `src/app/professional/patients/[patientId]/progress/create/page.tsx` | `/professional/patients/[id]/progress/create` | ⬜ |
| `src/app/professional/patients/[patientId]/meal-plan/page.tsx` | `/professional/patients/[id]/meal-plan` | ⬜ |
| `src/app/professional/patients/[patientId]/meal-plan/create/page.tsx` | `/professional/patients/[id]/meal-plan/create` | ⬜ |
| `src/app/professional/patients/[patientId]/meal-plan/[mealPlanId]/page.tsx` | `/professional/patients/[id]/meal-plan/[id]` | ⬜ |
| `src/app/professional/patients/[patientId]/appointments/page.tsx` | `/professional/patients/[id]/appointments` | ⬜ |
| `src/app/professional/patients/[patientId]/training/page.tsx` | `/professional/patients/[id]/training` | ⬜ |
| `src/app/professional/appointments/page.tsx` | `/professional/appointments` | ⬜ |
| `src/app/professional/invite-codes/page.tsx` | `/professional/invite-codes` | ⬜ |
| `src/app/professional/schedules/page.tsx` | `/professional/schedules` | ⬜ |
| `src/app/professional/settings/page.tsx` | `/professional/settings` | ⬜ |

**`professional/page.tsx`** — Dashboard
- "Today" → "Hoje"
- "Today's appointments" → "Consultas de hoje"
- "{count} total" → "{count} total"
- "No appointments today" → "Sem consultas hoje"
- "Your schedule is clear for today." → "Sua agenda está livre hoje."
- "Previous" → "Anterior"
- "Now" → "Agora"
- "Next" → "Próxima"
- "{time} min" → "{time} min"
- "Quick access" → "Acesso rápido"
- "My Patients" → "Meus pacientes"
- "View and manage your patients" → "Visualize e gerencie seus pacientes"
- "Agenda" → "Agenda"
- "View all your appointments" → "Veja todas as suas consultas"
- "Invite Codes" → "Códigos de convite"
- "Generate codes for new patients" → "Gere códigos para novos pacientes"
- "Schedules" → "Horários"
- "Manage your availability" → "Gerencie sua disponibilidade"

**`professional/patients/page.tsx`**
- "My Patients" → "Meus pacientes"
- "No patients yet" → "Nenhum paciente ainda"
- "{count} patient(s)" → "{count} paciente(s)"
- "Search by name or email…" → "Buscar por nome ou e-mail…"
- "No patients match "{search}"" → "Nenhum paciente encontrado para "{search}""
- "Generate an invite code to add your first patient." → "Gere um código de convite para adicionar seu primeiro paciente."
- "Go to Invite Codes" → "Ir para códigos de convite"
- "Failed to load patients" → "Falha ao carregar pacientes"

**`professional/patients/[patientId]/page.tsx`**
- "← My Patients" → "← Meus pacientes"
- "{age} years old" → "{age} anos"
- "{height} cm" → "{height} cm"
- "{weight} kg" → "{weight} kg"
- "Progress" → "Progresso"
- "View measurement history" → "Ver histórico de medidas"
- "Meal Plans" → "Planos alimentares"
- "Manage nutrition plans" → "Gerenciar planos nutricionais"
- "Appointments" → "Consultas"
- "Schedule and history" → "Agenda e histórico"
- "Training" → "Treino"
- "Workouts and exercises" → "Treinos e exercícios"
- "Active Meal Plan" → "Plano alimentar ativo"
- "Edit" → "Editar"
- "Create" → "Criar"
- "No active meal plan yet." → "Nenhum plano alimentar ativo."
- "{count} meal(s)" → "{count} refeição(ões)"
- "Active" → "Ativo"
- "Payment Plan" → "Plano de pagamento"
- "Manage plan" → "Gerenciar plano"
- "Set plan" → "Definir plano"
- "Payment Schedule" → "Histórico de pagamentos"
- "No plan set." → "Nenhum plano definido."
- "Recent Progress" → "Progresso recente"
- "Add" → "Adicionar"
- "No progress entries yet." → "Nenhum registro de progresso ainda."
- "BMI {bmi}" → "IMC {bmi}"
- "{percentage}% body fat" → "{percentage}% gordura"
- "View all progress →" → "Ver todo o progresso →"
- "+ {count} earlier payment(s) made" → "+ {count} pagamento(s) anterior(es)"
- "Overdue" → "Atrasado"
- "Upcoming" → "Próximo"
- "Failed to load patient data" → "Falha ao carregar dados do paciente"

**`professional/patients/[patientId]/plan/page.tsx`**
- "Payment Plan" → "Plano de pagamento"
- "Price" → "Valor"
- "Currency" → "Moeda"
- "Billing cycle" → "Ciclo de cobrança"
- Monthly/Quarterly/Annual/Custom → "Mensal" / "Trimestral" / "Anual" / "Personalizado"
- "Status" → "Status"
- Active/Paused/Cancelled → "Ativo" / "Pausado" / "Cancelado"
- "Start date" → "Data de início"
- "Next payment date" → "Próxima data de pagamento"
- "Last payment date" → "Última data de pagamento"
- "(mark paid)" → "(marcar como pago)"
- "Notes" → "Observações"
- "(optional)" → "(opcional)"
- "Any notes about this plan…" → "Observações sobre o plano…"
- "Saving…" / "Save plan" → "Salvando…" / "Salvar plano"
- "Plan saved successfully." → "Plano salvo com sucesso."
- "Failed to save plan" → "Falha ao salvar o plano"
- "Failed to load data." → "Falha ao carregar dados."
- "Payment History" → "Histórico de pagamentos"
- "+ {count} earlier payment(s) made" → "+ {count} pagamento(s) anterior(es)"
- "Overdue" → "Atrasado"
- "Upcoming" → "Próximo"

**`professional/appointments/page.tsx`**
- "← Back to Dashboard" → "← Voltar ao painel"
- "Agenda" → "Agenda"
- "All" / "Upcoming" / "Past" → "Todos" / "Próximas" / "Anteriores"
- "No appointments found" → "Nenhuma consulta encontrada"
- "No upcoming appointments." → "Nenhuma consulta agendada."
- "No past appointments." → "Nenhuma consulta anterior."
- "No appointments scheduled yet." → "Nenhuma consulta cadastrada."
- "{time} {minutes} min" → "{time} {minutes} min"
- "Cancelled: {reason}" → "Cancelada: {reason}"
- "Failed to load appointments" → "Falha ao carregar consultas"

**`professional/invite-codes/page.tsx`**
- "← Back to Dashboard" → "← Voltar ao painel"
- "Invite Codes" → "Códigos de convite"
- "Generate Code" → "Gerar código"
- "No invite codes yet" → "Nenhum código ainda"
- "Generate a code to invite a new patient." → "Gere um código para convidar um novo paciente."
- "used by {name}" → "usado por {name}"
- "expires {date}" → "expira em {date}"
- "Used" / "Expired" / "Available" → "Usado" / "Expirado" / "Disponível"
- "Copy code" → "Copiar código"
- "Copied!" → "Copiado!"
- "Generate Invite Code" → "Gerar código de convite"
- "Enter the patient's name to generate a code." → "Digite o nome do paciente para gerar um código."
- "Patient Name" → "Nome do paciente"
- "e.g., John Doe" → "ex.: Maria Silva"
- "Cancel" → "Cancelar"
- "Generating…" / "Generate Code" → "Gerando…" / "Gerar código"
- "Patient name is required" → "Nome do paciente obrigatório"
- "Failed to generate invite code" → "Falha ao gerar código de convite"

**`professional/schedules/page.tsx`**
- "← Back to Dashboard" → "← Voltar ao painel"
- "Appointments" → "Consultas"
- "Add Schedule" → "Adicionar horário"
- "No appointments scheduled" → "Nenhuma consulta agendada"
- "Create your first appointment to get started." → "Crie sua primeira consulta para começar."
- "Confirmed" / "Pending" / "Requested" / "Cancelled" / "Completed" → "Confirmada" / "Pendente" / "Solicitada" / "Cancelada" / "Concluída"
- "Cancel Appointment" → "Cancelar consulta"
- "Please provide a reason for cancelling." → "Informe o motivo do cancelamento."
- "Enter cancellation reason…" → "Motivo do cancelamento…"
- "Keep Appointment" → "Manter consulta"
- "Cancelling…" / "Cancel Appointment" → "Cancelando…" / "Cancelar consulta"
- "Please provide a cancellation reason" → "Informe o motivo do cancelamento"
- "Failed to cancel appointment" → "Falha ao cancelar consulta"
- "Failed to load appointments" → "Falha ao carregar consultas"

**`professional/settings/page.tsx`**
- "Settings" → "Configurações"
- "Manage your profile information" → "Gerencie suas informações de perfil"
- "Name" → "Nome"
- "Your full name" → "Seu nome completo"
- "Phone" → "Telefone"
- "+55 (11) 99999-9999" → "+55 (11) 99999-9999"
- "Specialization" → "Especialização"
- "e.g. Sports Nutrition" → "ex.: Nutrição Esportiva"
- "Professional license" → "Registro profissional (CRN)"
- "CRN-0 00000" → "CRN-0 00000"
- "Bio" → "Bio"
- "(optional)" → "(opcional)"
- "A short description about yourself…" → "Uma breve descrição sobre você…"
- "Saving…" / "Save profile" → "Salvando…" / "Salvar perfil"
- "Profile updated successfully." → "Perfil atualizado com sucesso."
- "Account" → "Conta"
- "To change your email or password, contact your administrator." → "Para alterar seu e-mail ou senha, entre em contato com o administrador."
- "Failed to load profile." → "Falha ao carregar perfil."
- "Failed to save profile" → "Falha ao salvar perfil"

---

## Patient

| File | Route | Status |
|------|-------|--------|
| `src/app/patient/page.tsx` | `/patient` | ⬜ |
| `src/app/patient/nutritionist/page.tsx` | `/patient/nutritionist` | ⬜ |
| `src/app/patient/meal-plan/page.tsx` | `/patient/meal-plan` | ⬜ |
| `src/app/patient/meal-plan/[mealPlanId]/page.tsx` | `/patient/meal-plan/[id]` | ⬜ |
| `src/app/patient/progress/page.tsx` | `/patient/progress` | ⬜ |
| `src/app/patient/training/page.tsx` | `/patient/training` | ⬜ |

**`patient/page.tsx`** — Dashboard
- "Hello, {firstName}" → "Olá, {firstName}"
- "Here's an overview of your health journey" → "Aqui está uma visão geral da sua jornada de saúde"
- "My Meal Plan" → "Meu plano alimentar"
- "View your current nutrition plan" → "Veja seu plano nutricional atual"
- "Progress" → "Progresso"
- "Track your health journey" → "Acompanhe sua jornada de saúde"
- "Training" → "Treino"
- "Track your gym progress" → "Acompanhe seu progresso na academia"
- "My Nutritionist" → "Meu nutricionista"
- "View your nutritionist and plan" → "Veja seu nutricionista e plano"

**`patient/nutritionist/page.tsx`**
- "← Dashboard" → "← Painel"
- "My Nutritionist" → "Meu nutricionista"
- "Nutritionist Info" → "Informações do nutricionista"
- "Phone" → "Telefone"
- "Specialization" → "Especialização"
- "License" → "Registro"
- "About" → "Sobre"
- "My Plan" → "Meu plano"
- "Status" → "Status"
- "Price" → "Valor"
- "Payment Schedule" → "Histórico de pagamentos"
- "Notes" → "Observações"
- "No plan assigned yet. Contact your nutritionist." → "Nenhum plano atribuído. Entre em contato com seu nutricionista."
- "Failed to load data. Please try again." → "Falha ao carregar dados. Tente novamente."
- Active/Paused/Cancelled → "Ativo" / "Pausado" / "Cancelado"
- monthly/quarterly/annual/custom → "mensal" / "trimestral" / "anual" / "personalizado"
- "Overdue" → "Atrasado"
- "Upcoming" → "Próximo"
- "+ {count} earlier payment(s) made" → "+ {count} pagamento(s) anterior(es)"
- "No scheduled payments." → "Nenhum pagamento agendado."

**`patient/meal-plan/page.tsx`**
- "← Back to Dashboard" → "← Voltar ao painel"
- "Nutrition Plans" → "Planos alimentares"
- "No meal plans yet" → "Nenhum plano alimentar ainda"
- "Your nutritionist will create one for you soon." → "Seu nutricionista criará um em breve."
- "Active" → "Ativo"
- "{count} meal(s)" → "{count} refeição(ões)"
- "Failed to load meal plans" → "Falha ao carregar planos alimentares"

**`patient/progress/page.tsx`**
- "← Back to Dashboard" → "← Voltar ao painel"
- "Progress History" → "Histórico de progresso"
- "No entries yet" → "Nenhum registro ainda"
- "Your nutritionist will add your first progress entry soon." → "Seu nutricionista adicionará seu primeiro registro em breve."
- "BMI {bmi}" → "IMC {bmi}"
- "{percentage}% fat" → "{percentage}% gordura"
- "Failed to load progress data" → "Falha ao carregar dados de progresso"

**`patient/training/page.tsx`**
- "← Back to Dashboard" → "← Voltar ao painel"
- "Training" → "Treino"
- "Sessions" → "Sessões"
- "Log and view your training sessions" → "Registre e veja suas sessões de treino"
- "Workouts" → "Treinos"
- "Create and manage workout templates" → "Crie e gerencie modelos de treino"
- "Exercise Library" → "Biblioteca de exercícios"
- "Browse and add exercises" → "Explore e adicione exercícios"

---

## Navigation & Shared Components

| File | Status |
|------|--------|
| `src/components/nav/admin-nav.tsx` | ⬜ |
| `src/components/nav/professional-nav.tsx` | ⬜ |
| `src/components/nav/patient-nav.tsx` | ⬜ |
| `src/components/logout-button.tsx` | ⬜ |

**`admin-nav.tsx`**
- "Dashboard" → "Painel"
- "Nutritionists" → "Nutricionistas"
- "Sign out" → "Sair"

**`professional-nav.tsx`**
- "Dashboard" → "Painel"
- "Patients" → "Pacientes"
- "Appointments" → "Consultas"
- "Invite Codes" → "Convites"
- "Schedules" → "Horários"
- "Settings" → "Configurações"
- "Sign out" → "Sair"

**`patient-nav.tsx`**
- "Dashboard" → "Painel"
- "Meal Plan" → "Plano alimentar"
- "Progress" → "Progresso"
- "Training" → "Treino"
- "Sign out" → "Sair"

**`logout-button.tsx`**
- "Sign out" → "Sair"

---

## Date & Number Formats

All `toLocaleDateString("en-US", ...)` calls → `toLocaleDateString("pt-BR", ...)`
All `"en-US"` locale references in date formatting → `"pt-BR"`

---

*Last updated: 2026-02-15*
