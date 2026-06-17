Versão final do README.md do projeto.

# Integrantes e Atribuições

## Integrantes

* **Gabrielle Maia** – Matrícula: **24200091**
* **Marina Monalisa** – Matrícula: **24200681**

## Atribuições

O projeto foi desenvolvido integralmente em conjunto pelas duas integrantes. Todas as etapas, incluindo planejamento, desenvolvimento, testes, correções e documentação, foram realizadas de forma colaborativa, com participação ativa de ambas durante todo o processo.

# Como Executar o Projeto

## 1. Instalar as dependências

```bash
npm install
```

## 2. Remover as dependências instaladas (se necessário)

```bash
rm -rf node_modules package-lock.json
```

## 3. Instalar as dependências novamente

```bash
npm install
```

## 4. Instalar o Expo CLI globalmente

```bash
npm install -g expo-cli
```

## 5. Verificar a instalação do ngrok

```bash
npm list -g @expo/ngrok
```

Resultado esperado:

```bash
@expo/ngrok@4.1.0
```

## 6. Corrigir erro relacionado ao Babel (se ocorrer)

```bash
npm install --save-dev babel-preset-expo
```

## 7. Executar o projeto

```bash
npx expo start --tunnel --go -c
```
