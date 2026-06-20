# MagicSpiderFrontend

MagicSpiderFrontend is an Angular-based slide authoring interface with canvas editing, AI-assisted slide generation, and presentation export features.

## Overview

This application lets users create, edit, and save slide presentations in the browser. It includes:

- A slide workspace powered by Konva for drag-and-drop canvas components
- Text, image, and basic shape tools
- AI helpers for enriching slides via a "Magic Spider" assistant
- Slide saving via browser localStorage
- PPTX export using `pptxgenjs`

## Key Features

- **Presentation library**: create and manage multiple presentations from the home page
- **Canvas slide editor**: add slides, select components, and update properties using side panels
- **AI assistant**: use the Magic Spider agent to analyze slides and generate or update content
- **Local persistence**: saved presentations live in `localStorage`
- **Export to PPTX**: download slide decks as PowerPoint files
- **Modern Angular UI**: built with Angular 18, `ng-zorro-antd`, Bootstrap, and `ngx-quill`

## Project Structure

- `src/app/app.module.ts` - root module
- `src/app/app-routing.module.ts` - route config for home and workspace
- `src/app/components/home` - home page and presentation browser
- `src/app/features/slide-presentation` - slide editor feature module
- `src/app/features/slide-presentation/pages/workspace` - main editor workspace
- `src/app/features/slide-presentation/components` - slide, toolbox, AI assistant, and description UI
- `src/app/services/konva.services` - presentation and Konva canvas services
- `src/app/services` - AI provider services, MCP integration, and agents
- `src/app/features/slide-presentation/MCP` - Model Context Protocol tool integration

## Running Locally

1. Install dependencies

```bash
npm install
```

2. Start the development server

```bash
npm start
```

3. Open the app

Navigate to `http://localhost:4200/`

## Available Scripts

- `npm start` - runs the Angular development server
- `npm run build` - builds the application
- `npm run watch` - builds in watch mode for development
- `npm test` - runs unit tests via Karma


## Dependencies

Major dependencies include:

- `@angular/*` (18.x)
- `bootstrap`
- `ng-zorro-antd`
- `konva`
- `pptxgenjs`
- `ngx-quill`
- `@google/genai`
- `@modelcontextprotocol/sdk`
- `ollama`
- `zod`


