# What'flow — MVP MarceMarce Interiores

Protótipo web mobile-first de pré-atendimento e qualificação de pedidos de orçamento, com encaminhamento para WhatsApp.

## Requisitos
- VS Code
- Extensão Live Server (ou outro servidor HTTP local)
- Navegador moderno
- Git para publicação no GitHub Pages

## Executar localmente
1. Extraia a pasta do ZIP.
2. Abra a pasta `whatflow-mvp` no VS Code.
3. Inicie o `index.html` com Live Server.
4. Teste o formulário, a revisão e o encaminhamento WhatsApp.

> Não abra `index.html` directamente como `file://`, porque a configuração JSON é carregada por `fetch` e os navegadores bloqueiam esse acesso em muitos casos.

## Estrutura
```text
whatflow-mvp/
├── index.html
├── styles.css
├── js/
│   └── app.js
└── config/
    └── companies/
        └── marcemarce.json
```

## Configuração da empresa
Edite `config/companies/marcemarce.json` para alterar identidade, WhatsApp, horário, serviços e dados comerciais. O motor de formulário está em `js/app.js`.

## Publicar no GitHub Pages
1. Crie um repositório GitHub, por exemplo `whatflow`.
2. Envie o conteúdo desta pasta para a raiz do repositório.
3. No GitHub, abra **Settings → Pages**.
4. Em Build and deployment, seleccione **Deploy from a branch**.
5. Escolha `main` e `/ (root)` e grave.
6. Aguarde a publicação e abra o endereço apresentado pelo GitHub Pages.

Se publicar num subcaminho de um site, mantenha os caminhos relativos `./styles.css`, `./js/app.js` e `./config/...`.

## Limitações desta versão
- O botão abre WhatsApp com mensagem pré-preenchida; o cliente tem de carregar em Enviar.
- Não há backend, painel de administração, autenticação, armazenamento de leads nem confirmação automática de envio.
- A pontuação é uma sugestão de triagem e precisa de validação comercial.
- A configuração de províncias deve ser revista para corresponder à divisão administrativa que a empresa pretende usar.
- O consentimento e a nota de privacidade são uma base inicial; devem ser revistos segundo as práticas e obrigações legais aplicáveis antes do uso comercial.
- Não guardar segredos nem dados pessoais em repositório público.

## Checklist de teste
- [ ] Todas as categorias aparecem.
- [ ] As perguntas condicionais são mostradas correctamente.
- [ ] O cliente pode voltar e corrigir dados.
- [ ] Campos obrigatórios impedem avanço quando vazios.
- [ ] A revisão final corresponde às respostas.
- [ ] O WhatsApp abre para o número configurado.
- [ ] A mensagem está correctamente codificada.
- [ ] Testado em Android e desktop.
