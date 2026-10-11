# Solicitações de acesso — implantação segura

A interface (PT/EN/ES) coleta instituição/organização e justificativa na opção **Solicitar acesso**. A senha permanece no Firebase Authentication. O usuário deve verificar o e-mail antes da criação de `access_requests/{uid}`, cujo estado inicial é `pending`.

## Notificação administrativa

O backend `functions/index.js` inclui `notifyAccessRequest`, disparado pela criação do pedido no Firestore. O destinatário fixo é `inteligencia@wcs.org`. O aviso apresenta e-mail confirmado, instituição, justificativa e link de revisão `https://acarvalho-wcs.github.io/nimf-site/secure.html?request=<uid>`.

O link **não aprova** o pedido. Ao abri-lo, é necessário estar autenticado com a conta administrativa e confirmar a ação no botão **Aprovar acesso**. Isso evita aprovações provocadas por pré-visualizações e verificadores automáticos de links de e-mail. Não há suporte seguro e universal para aprovar diretamente com um clique dentro de qualquer cliente de e-mail sem confirmação.

## Aprovação

O endpoint `approveAccessRequest` valida o ID token Firebase, exige a conta administrativa institucional, confere `access/{adminUid}.admin == true`, verifica a confirmação de e-mail do solicitante e aprova por transação. A gravação de `access/{uid}` permanece bloqueada a clientes e não confere privilégios de administrador nem acesso a Relatórios de Inteligência.

## Ativação pendente

Este código não está implantado em Cloud Functions. É necessário, por administrador habilitado no projeto Firebase:

1. Configurar cobrança/plano compatível com Firebase Functions e habilitar as APIs pertinentes, quando necessário.
2. Configurar credenciais de um SMTP autorizado a enviar mensagens, via Firebase Secrets (não salvar segredos no GitHub):
   `NIMF_SMTP_HOST`, `NIMF_SMTP_PORT`, `NIMF_SMTP_USER`, `NIMF_SMTP_PASSWORD`, `NIMF_SMTP_FROM`.
3. Na máquina ou ambiente de deploy autorizado, executar `npm --prefix functions install` e `firebase deploy --only functions:nimf-access,firestore:rules --project <project-id>` **após verificar as opções de implantação e o project ID ativo**. Firebase CLI pode exigir escolher funções separadamente por nome; se necessário, utilizar `firebase deploy --only functions,firestore:rules`. Não colocar credenciais administrativas no navegador.
4. Testar as regras com o emulador, criar uma conta de teste e verificar que e-mail de administração chega ao destino, que links apenas abrem a página, que a decisão pede confirmação e que a aprovação do painel **não concede** acesso a relatórios.
5. Configurar SPF/DKIM/DMARC no domínio de envio conforme orientação da equipe de TI, para entregabilidade.

A coleção `access_requests` só poderá ser escrita uma vez pelo próprio solicitante com e-mail verificado. Para evitar mensagens repetidas, a notificação dispara apenas na criação do documento. O administrador deve revisar pedidos manualmente; nunca aprovar automaticamente pedidos com base apenas no domínio do e-mail.

**Nunca enviar segredos, anexos de relatórios ou tokens de aprovação por e-mail.**
