# 🍽️ MVP - Sistema Whitelabel de Gerenciamento de Pedidos

Sistema completo de pedidos online com **landing page**, **cardápio digital**, **painel de gerenciamento** e **dashboard administrativo**. Desenvolvido como MVP para treinar equipe fullstack com foco em boas práticas, organização, autenticação, e integração frontend-backend.

---

## 🔗 Demo (em breve)

[🔴 Link da Landing Page](#)  
[🟢 Link do Painel Administrativo](#)

---

## 🧠 Visão Geral

> Projeto dividido em 3 módulos principais:

- 🖥️ **Frontend Público**: Landing Page e Cardápio Digital
- ⚙️ **Backend API**: Node.js + Express + SQLite
- 🧑‍💼 **Dashboard Admin**: Login do gerente, gerenciamento de produtos e pedidos

---

## 🛠️ Tecnologias

### Frontend
- [React](https://react.dev/)
- CSS3 (sem Tailwind)
- Redux (caso necessário)

### Backend
- Node.js + Express
- SQLite (via Prisma ou raw queries)
- JWT Auth
- CORS, Postman entre outros...

---

## 📁 Estrutura de Pastas

```bash
.
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── middlewares/
├── frontend/
│   ├── public/
│   └── src/
│       ├── pages/
│       ├── components/
│       └── store/
├── README.md
