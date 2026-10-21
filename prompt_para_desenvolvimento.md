# Prompt de Instruções: Aplicação Web de Previsão do Tempo (Open-Meteo API)

Você é um desenvolvedor frontend e designer UI/UX encarregado de criar um site estático moderno de previsão do tempo utilizando a API gratuita da **Open-Meteo**.

## 🎯 Objetivo

Criar uma interface web estática (HTML/CSS/JS) com layout moderno, unindo **elementos de natureza e tecnologia**, onde o usuário digita o nome de uma cidade e visualiza:

1. As condições meteorológicas **atuais** da cidade.
2. A previsão do tempo para os **próximos 5 dias**.

---

## 🎨 Conceito Visual e Design (Natureza + Tecnologia)

A interface deve seguir um conceito visual **"Solarpunk / Eco-Tech"** ou **"Hi-Tech Organic"**, combinando elementos orgânicos da natureza com uma estética digital moderna:

- **Estilo de Layout**:
  - Utilização de **Glassmorphism** (efeito de vidro fosco com transparências e `backdrop-filter: blur`).
  - Cantos arredondados, sombras suaves e bordas iluminadas discretas (efeito *glow* tecnológico).
- **Paleta de Cores**:
  - Tons da natureza: Verdes orgânicos, azuis profundos, gradientes de céu e tons de terra/folha.
  - Sotaques tecnológicos: Detalhes luminosos (Ciano elétrico, Emerald, Lime ou Violeta neon) para destaques de dados.
  - Suporte a gradientes dinâmicos no fundo que mudam levemente de acordo com o clima retornado (ex: tons mais ensolarados, chuvosos ou noturnos).
- **Tipografia e Ícones**:
  - Fontes modernas e limpas (ex: *Inter*, *Plus Jakarta Sans* ou *Outfit*).
  - Ícones minimalistas e fluidos (ex: Lucide Icons, Feather Icons ou SVG customizados) para os estados climáticos e dados como vento e umidade.

---

## 📚 Etapa 1: Estudo e Mapeamento da API Open-Meteo

Antes de codificar, analise a documentação em <https://open-meteo.com/en/docs>:

1. **Geocoding API**:
   - A API principal da Open-Meteo exige coordenadas de latitude e longitude (`latitude`, `longitude`).
   - Utilize a **Geocoding API** da Open-Meteo (`https://geocoding-api.open-meteo.com/v1/search?name={nome_da_cidade}&count=1&language=pt&format=json`) para converter o nome digitado na cidade em latitude e longitude.

2. **Forecast API**:
   - URL Base: `https://api.open-meteo.com/v1/forecast`
   - **Parâmetros necessários**:
     - `latitude` e `longitude` (obtidos no Geocoding)
     - `current_weather=true` (ou `current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`)
     - `daily=weather_code,temperature_2m_max,temperature_2m_min`
     - `forecast_days=6` (para garantir o dia atual + 5 dias à frente)
     - `timezone=auto` (para ajustar ao fuso horário local da cidade)

3. **Mapeamento de Códigos de Tempo (WMO Weather interpretation codes)**:
   - A API retorna códigos numéricos (`weather_code` / `weathercode`), por exemplo:
     - `0`: Céu limpo
     - `1, 2, 3`: Parcialmente nublado / Ensolarado
     - `45, 48`: Nevoeiro
     - `51, 53, 55, 61, 63, 65`: Chuva leve a intensa
     - `80, 81, 82`: Pancadas de chuva
   - Mapeie esses códigos para textos amigáveis em português e ícones adequados ao tema.

---

## 💻 Etapa 2: Requisitos de Desenvolvimento do Site

### 1. Arquitetura do Projeto
- Projeto estático contendo um único arquivo HTML (com CSS e JS embutidos) ou pasta estruturada com `index.html`, `style.css` e `app.js`.
- Pode utilizar CSS utilitário (como Tailwind CSS via CDN) para agilizar o layout moderno e estilização Glassmorphism.

### 2. Interface do Usuário (UI / UX)
- **Barra de Busca Futurista**: Campo de busca integrado com ícones e transições suaves ao focar ou pesquisar.
- **Feedback Visual**:
  - Animação de carregamento (*skeleton screen* ou *spinner* neon/orgânico).
  - Tratamento de erros amigável e estilizado.
- **Painel Central do Tempo Atual (Glass Card)**:
  - Nome da cidade e país com indicador visual do clima.
  - Temperatura atual destacada em grande escala.
  - Descrição da condição climática + ícone vetorial correspondente.
  - Cards secundários de métricas (Velocidade do vento, Umidade relativa, etc.).
- **Seção de Previsão de 5 Dias**:
  - Disposição em grid responsivo ou carrossel horizontal de cards de vidro (*Glassmorphism*).
  - Exibição de: Dia da semana, Ícone climático, variação de Temperatura Máxima / Mínima com barras indicadoras visuais.

### 3. Funcionalidades de Código (JS)
- Manipulação assíncrona com `fetch` e `async/await`.
- Tratamento de exceções (blocos `try/catch`).
- Formatação de datas em português (`Intl.DateTimeFormat`).

---

## ✅ Checklist de Entrega
- [ ] Interface visual alinhada ao conceito **Natureza + Tecnologia** (Glassmorphism, cores orgânicas e detalhes neon/modernos).
- [ ] O usuário consegue buscar qualquer cidade válida.
- [ ] Tratamento caso o usuário digite um nome inválido ou em branco.
- [ ] Exibição do tempo atual e dos 5 dias subsequentes.
- [ ] Layout 100% responsivo (mobile-first / adaptável para desktop).