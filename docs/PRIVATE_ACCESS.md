# NIMF — Área privada sem Google Sheets

O site público do NIMF continua em GitHub Pages. A nova página `secure.html` permitirá cadastro e login **com e-mail e senha próprios**, sem GitHub e sem Google Sheets.

## Serviços e custos
- **Firebase Authentication**: armazena/verifica senhas; não criamos armazenamento de hashes em Sheets.
- **Firestore**: guarda as permissões de usuários e os registros autorizados. As regras de segurança são aplicadas pelo serviço, não pelo frontend.
- **GitHub Pages**: hospeda HTML/CSS/JS, que são arquivos públicos. Não inserir dados privados no repositório `nimf-site`.
- Projeto piloto no plano **Spark (gratuito)**, sujeito a cotas. Não exigir cartão nem ativar faturamento. Algumas modalidades de login ou recursos pagos não são necessários.

## Configuração pelo administrador
1. Em https://console.firebase.google.com/ clique em **Adicionar projeto** e crie `nimf-private` usando **Spark** (sem faturamento).
2. Acesse **Build → Authentication → Sign-in method**, ative **Email/Password**, não ative provedores extras nem conta anônima. Em **Settings → Authorized domains** acrescente `acarvalho-wcs.github.io` se não constar.
3. Acesse **Firestore Database → Create database** e escolha um local apropriado. Ative em modo de produção, que nega acessos por padrão.
4. Copie as regras do arquivo `firestore.rules` do repositório para a aba **Firestore Database → Rules**, publique e confirme que estão ativas. **Não use regras com `allow read, write: if true` nem "test mode".**
5. No projeto Firebase, em **Project settings → Your apps → Web**, registre uma aplicação Web. Os valores de configuração web (`apiKey`, `authDomain`, `projectId`, `appId`) não são credenciais secretas. Coloque-os no arquivo público `firebase-config.js`. **Nunca coloque service account, Firebase Admin SDK private key, senha de administrador ou token pessoal no repositório.**
6. Aguarde o deploy do GitHub Pages e entre em `https://acarvalho-wcs.github.io/nimf-site/secure.html`.

## Aprovação de usuários
O usuário escolhe e-mail e senha na aba **Solicitar acesso**, confirma o e-mail por link e aguarda sua aprovação. Cadastro **não concede acesso** aos registros.

Para aprovar uma conta:
1. Em Firebase Console → Authentication → Users, localize a conta e copie o **User UID**.
2. Firestore → Data → `access` → **Add document**; use **o UID exato como ID do documento**.
3. Adicione o campo `approved` como **boolean true** (não a string `"true"`).
4. Com o login ativo e e-mail verificado, o usuário usa **Verificar novamente** e os dados são carregados.

Para revogar, altere o campo `approved` para **boolean false** ou exclua esse documento. **Atenção:** a verificação ocorre em novas leituras; informações já carregadas ou exportadas para o computador do usuário não podem ser remotamente apagadas. Para maior controle, são necessários complementos de segurança.

## Dados privados
Apenas documentos de `records/{id}` podem ser consultados, e **somente depois** de autenticação, verificação de e-mail e aprovação via `access/{uid}`.

O frontend reconhece estes campos, todos opcionais: `title`, `category`, `source`, `status`. Para testar sem dados confidenciais, crie um documento fictício sem informações pessoais ou investigativas.

**Não existe sincronização automática do GitHub privado com o Firestore nesta etapa.** A base canônica no repositório privado não foi alterada, e dados reais não devem ser importados até uma auditoria de segurança, definição de níveis de sensibilidade, política de retenção, testes de permissão e avaliação de custos/limites.

## Testes obrigatórios de segurança
- Conta não logada: leitura de `records` negada.
- Conta criada, sem e-mail verificado: acesso negado.
- Conta verificada sem `access/uid`: acesso negado.
- Conta verificada com `approved: false`: acesso negado.
- Conta verificada com `approved: true`: leitura permitida.
- Nenhuma conta cliente pode criar ou modificar `access` ou `records`.
- Alteração de `approved` para `false`: novas leituras negadas.
- Verificar com Firebase Emulator Suite ou Rule Playground antes de disponibilizar informações sensíveis.

## Limites
As credenciais são geridas pelo Firebase. O site estático não tem servidor próprio nem pode autenticar diretamente GitHub privado com segurança. Firestore constitui uma **base privada independente** e não Google Sheets. As consultas atuais carregam até 200 registros por página; paginação, logs/auditoria, escalabilidade, proteção contra abuso e MFA devem ser avaliados antes de produção.


## Proposta em PR #3 — contribuições privadas e mapa MapLibre

**Antes de fazer merge da PR:** publicar o conteúdo revisado de `firestore.rules` no console do projeto `fir-console-61443` (Firestore > Rules), após testar regras com usuário não aprovado, usuário aprovado (autor), outro usuário aprovado (não autor) e administrador. O frontend não publica regras automaticamente.

### Administrador de triagem

Em Firestore > Data > `access/{UID_DO_ADMINISTRADOR}`, acrescentar campo booleano `admin: true`, mantendo `approved: true`. Apenas quem administra o projeto pode alterar essa autorização. Sem o campo, a conta continua com acesso aos registros públicos do painel restrito, mas não terá permissão para revisar contribuições de terceiros.

### Segurança e privacidade

- Submissão em `submissions/{id}`, com `owner_uid` fixado pelo Firebase Authentication. Somente o autor e um administrador aprovado podem ler o registro; novos usuários não podem ver contribuições de terceiros.
- O usuário pode criar uma submissão, mas não editar `status`, `review_note`, `owner_uid` nem eliminar um registro.
- Administrador pode atualizar apenas `status`, `review_note` e `updated_at`, podendo anexar eventos em `submissions/{id}/history`. A criação de eventos não substitui a necessidade de auditoria externa para preservação de provas.
- Os campos aceitam apenas URLs HTTPS e textos limitados. Não incluir nomes, telefones, imagens privadas, credenciais, dados pessoais ou alegações não verificadas; endereços de grupos podem conter tokens de convite e devem ser tratados como informação restrita.
- Firestore Rules devem ser testadas no emulador antes de uso com denúncias sensíveis. A lista atual traz no máximo 100 registros ao autor e 150 ao administrador; paginação é necessária para escalabilidade.
- Atualizações de status chegam em tempo real ao autor pela escuta Firestore. O histórico completo ainda não é exibido no frontend, embora eventos de atualização estejam previstos no banco.
- Para um canal formal de denúncias sigilosas, será necessária política de retenção, triagem de riscos, remoção de dados pessoais, rate limiting e definição do acesso administrativo. A conta técnica do GitHub possui direitos amplos no projeto apesar das regras de cliente; proteja a chave e a branch main.
