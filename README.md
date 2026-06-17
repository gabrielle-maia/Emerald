# COMANDOS PARA RODAR O PROJETO

## 1. Entrar na pasta do projeto

```bash
cd emerald
```

---

## 2. Instalar dependências

```bash
npm install
```

---

## 3. Instalar Expo CLI globalmente

```bash
npm install -g expo-cli
```

---

## 4. Remover versão antiga do ngrok (se existir)

```bash
npm uninstall -g @expo/ngrok
```

---

## 5. Instalar versão correta do ngrok

```bash
npm install -g @expo/ngrok@4.1.0 --force
```

---

## 6. Verificar instalação do ngrok

```bash
npm list -g @expo/ngrok
```

Deve aparecer:

```bash
@expo/ngrok@4.1.0
```

---

## 7. Rodar o projeto com Tunnel

```bash
npx expo start --tunnel --clear
```

---

## SE DER ERRO, LIMPAR TUDO E REINSTALAR

### Apagar dependências

```bash
rm -rf node_modules package-lock.json
```

### Instalar novamente

```bash
npm install
```

### Rodar novamente

```bash
npx expo start --tunnel --clear ou npx expo start --tunnel --go -c
```
