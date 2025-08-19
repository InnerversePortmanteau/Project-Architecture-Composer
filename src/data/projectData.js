export const projectData = {
  frontend: [
    { 
      id: 'react', 
      name: 'React.js', 
      icon: '⚛️', 
      structure: 'my-react-app/', 
      tip: 'React projects use bundlers like Vite or Webpack.',
      boilerplate: {
        'package.json': `{ "name": "react-app", "dependencies": { "react": "^18.2.0" } }`,
        'src/App.jsx': `import React from 'react';\n\nfunction App() { return <h1>Hello, React!</h1>; }`,
      }
    },
    { 
      id: 'vue', 
      name: 'Vue.js', 
      icon: '🟢', 
      structure: 'vue-project/', 
      tip: 'In Vue, .vue files bundle HTML, CSS, and JavaScript together.',
      boilerplate: {
        'package.json': `{ "name": "vue-app", "dependencies": { "vue": "^3.4.0" } }`,
        'src/App.vue': `<template><h1>Hello, Vue!</h1></template>`,
      }
    },
    { 
      id: 'angular', 
      name: 'Angular', 
      icon: '🅰️', 
      structure: 'angular-app/', 
      tip: 'Angular’s CLI generates a lot for you—use `ng generate component`.' ,
      boilerplate: {
        'package.json': `{ "name": "angular-app", "dependencies": { "@angular/core": "^17.0.0" } }`,
        'src/app/app.component.ts': `import { Component } from '@angular/core';\n\n@Component({ selector: 'app-root', template: '<h1>Hello, Angular!</h1>' })`,
      }
    },
    { 
      id: 'svelte', 
      name: 'SvelteKit', 
      icon: '', 
      structure: 'sveltekit-app/', 
      tip: 'SvelteKit’s file-based routing means creating a file in src/routes/ automatically creates a page.',
      boilerplate: {
        'package.json': `{ "name": "svelte-app", "dependencies": { "svelte": "^4.0.0" } }`,
        'src/routes/+page.svelte': `<h1>Hello, Svelte!</h1>`,
      }
    },
  ],
  backend: [
    { 
      id: 'express', 
      name: 'Express.js', 
      icon: '🟢', 
      structure: 'express-api/', 
      tip: 'Think of routes as the "addresses," controllers as the "delivery people," and services as the "kitchen."',
      boilerplate: {
        'package.json': `{ "name": "express-api", "dependencies": { "express": "^4.18.2" } }`,
        'server.js': `const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => res.send('Hello, Express!'));\n\napp.listen(3000);`,
      }
    },
    { 
      id: 'django', 
      name: 'Django', 
      icon: '🐍', 
      structure: 'django_project/', 
      tip: 'Django uses "apps" as submodules—you can have multiple apps in one project.',
      boilerplate: {
        'requirements.txt': `Django==4.2.0`,
        'manage.py': `#!/usr/bin/env python\nimport os\nimport sys\n\nif __name__ == '__main__':\n\t...`,
      }
    },
  ],
  devops: [
    { 
      id: 'docker', 
      name: 'Docker & Kubernetes', 
      icon: '🐳', 
      structure: 'my-app/', 
      tip: 'Containerized apps use a Dockerfile to build an image, then deploy to Kubernetes.' ,
      boilerplate: {
        'Dockerfile': `FROM node:18\nWORKDIR /usr/src/app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nCMD ["npm", "start"]`,
        'docker-compose.yml': `version: '3.8'\nservices:\n\tweb:\n\t\tbuild: .`,
      }
    },
    { 
      id: 'terraform', 
      name: 'Terraform', 
      icon: '🏗️', 
      structure: 'terraform-infra/', 
      tip: 'Terraform modules are like functions—write once, reuse across different environments.',
      boilerplate: {
        'main.tf': `resource "aws_s3_bucket" "my_bucket" { bucket = "my-unique-bucket-name" }`,
      }
    },
  ],
  databases: [
    { 
      id: 'postgresql', 
      name: 'PostgreSQL', 
      icon: '🐘', 
      structure: 'db-project/', 
      tip: 'Keep your database schema in version control with migrations.',
      boilerplate: {
        'docker-compose.yml': `services:\n\tdb:\n\t\timage: postgres:15\n\t\t...`,
        'migrations/001_initial.sql': `CREATE TABLE users ( id SERIAL PRIMARY KEY );`,
      }
    },
    { 
      id: 'mongodb', 
      name: 'MongoDB', 
      icon: '🍃', 
      structure: 'mongodb-project/', 
      tip: 'MongoDB is schema-less by default, but using a schema definition can help enforce consistency.',
      boilerplate: {
        'docker-compose.yml': `services:\n\tmongo:\n\t\timage: mongo:6\n\t\t...`,
        'scripts/seed.js': `db.users.insertOne({ name: "Alice" });`,
      }
    },
  ],
  freehosters: [
    { 
      id: 'netlify-react', 
      name: 'React + Netlify', 
      icon: '⚛️☁️', 
      structure: 'netlify-react-app/', 
      tip: 'Netlify provides zero-config continuous deployment from Git.',
      boilerplate: {
        'netlify.toml': `[build]\n\tcommand = "npm run build"\n\tpublish = "dist"`,
        'src/App.jsx': `import React from 'react';\n\nfunction App() { return <h1>Hello, Netlify!</h1>; }`,
      }
    },
    { 
      id: 'vercel-nextjs', 
      name: 'Next.js + Vercel', 
      icon: '⚡️☁️', 
      structure: 'nextjs-vercel-app/', 
      tip: 'Vercel is the creator of Next.js, making for a seamless deployment experience.',
      boilerplate: {
        'package.json': `{ "name": "nextjs-app", "dependencies": { "next": "^13.0.0" } }`,
        'pages/index.js': `function HomePage() { return <h1>Hello, Vercel!</h1>; }`,
      }
    },
    { 
      id: 'github-pages-html', 
      name: 'HTML + GitHub Pages', 
      icon: '📄🐈', 
      structure: 'github-pages-site/', 
      tip: 'A simple, free way to host static HTML pages directly from your GitHub repo.',
      boilerplate: {
        'index.html': `<!DOCTYPE html><html><body><h1>Hello, GitHub Pages!</h1></body></html>`,
      }
    },
  ],
  'cloud-infrastructure': [
    {
      id: 'aws-cdk',
      name: 'AWS CDK',
      icon: '🪣',
      structure: 'my-cdk-app/',
      tip: 'The AWS Cloud Development Kit (CDK) allows you to define your cloud infrastructure in code.',
      boilerplate: {
        'package.json': `{ "name": "aws-cdk-app", "dependencies": { "aws-cdk": "^2.10.0" } }`,
        'lib/my-stack.ts': `import * as cdk from 'aws-cdk-lib';\nimport { Construct } from 'constructs';\n\nexport class MyStack extends cdk.Stack { constructor(scope: Construct, id: string, props?: cdk.StackProps) { super(scope, id, props); } }`,
      }
    },
    {
      id: 'terraform-pulumi',
      name: 'Terraform & Pulumi',
      icon: '🪣',
      structure: 'my-infra/',
      tip: 'Terraform and Pulumi are both Infrastructure as Code (IaC) tools used to manage cloud resources.',
      boilerplate: {
        'main.tf': `resource "aws_s3_bucket" "example" { bucket = "my-unique-bucket-name" }`,
        'Pulumi.yaml': `name: my-pulumi-project\nruntime: nodejs`,
      }
    },
    {
      id: 'docker-only',
      name: 'Docker-only Project',
      icon: '🐳',
      structure: 'my-docker-project/',
      tip: 'A lightweight Docker project for rapid prototyping and containerization.',
      boilerplate: {
        'Dockerfile': `FROM node:18\nWORKDIR /usr/src/app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nCMD ["npm", "start"]`,
      }
    },
    {
      id: 'aws-serverless',
      name: 'AWS Serverless',
      icon: '☁️',
      structure: 'my-serverless-app/',
      tip: 'A serverless API with AWS Lambda and API Gateway.',
      boilerplate: {
        'template.yaml': `AWSTemplateFormatVersion: '2010-09-09'\nTransform: AWS::Serverless-2016-10-31\nResources:\n  MyApiFunction:\n    Type: AWS::Serverless::Function`,
        'src/handler.js': `exports.handler = async (event) => { return { statusCode: 200, body: JSON.stringify('Hello from Lambda!') }; };`,
      }
    },
  ],
  'emerging-tech': [
    {
      id: 'ai-ml',
      name: 'AI/ML Apps',
      icon: '🤖',
      structure: 'my-ai-app/',
      tip: 'Use Hugging Face, LangChain, or RAG architectures for AI/ML projects.',
      boilerplate: {
        'requirements.txt': `langchain\nhuggingface_hub`,
        'app.py': `from langchain.llms import HuggingFaceHub\nllm = HuggingFaceHub(repo_id="google/flan-t5-xl")\nprint(llm("What is the capital of France?"))`,
      }
    },
    {
      id: 'edge-computing',
      name: 'Edge Computing',
      icon: '🌐',
      structure: 'my-edge-app/',
      tip: 'Cloudflare Workers and Deno Deploy are fast platforms for deploying functions at the edge.',
      boilerplate: {
        'index.js': `addEventListener('fetch', event => { event.respondWith(handleRequest(event.request)) });\n\nasync function handleRequest(request) { return new Response('Hello, Edge!', { status: 200 }) }`,
      }
    },
    {
      id: 'wasm',
      name: 'Rust + WASM',
      icon: '🦀',
      structure: 'my-wasm-app/',
      tip: 'Compile Rust to WebAssembly (WASM) for high-performance web applications.',
      boilerplate: {
        'Cargo.toml': `[package]\nname = "my-wasm-app"`,
        'src/lib.rs': `#[no_mangle]\npub extern "C" fn greet() {\n  println!("Hello, WASM!");\n}`,
      }
    },
    {
      id: 'web3',
      name: 'Web3 / Blockchain',
      icon: '🔗',
      structure: 'my-web3-app/',
      tip: 'A decentralized application (dapp) using smart contracts and a web3 library.',
      boilerplate: {
        'hardhat.config.js': `require("@nomiclabs/hardhat-waffle");\nmodule.exports = { solidity: "0.8.4", };`,
        'contracts/MyContract.sol': `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.4;\n\ncontract MyContract { string public greeting = "Hello, Web3!"; }`,
      }
    },
  ],
  'team-enterprise': [
    {
      id: 'monorepo',
      name: 'Monorepo',
      icon: '📦',
      structure: 'my-monorepo/',
      tip: 'Organize multiple projects in a single repository using tools like Nx or Turborepo.',
      boilerplate: {
        'nx.json': `{ "extends": "nx/presets/npm.json" }`,
        'apps/api/src/main.ts': `// API service`,
        'apps/web/src/main.ts': `// Web app`,
      }
    },
    {
      id: 'micro-frontends',
      name: 'Micro-Frontends',
      icon: '🧩',
      structure: 'my-micro-frontend-app/',
      tip: 'Build a modular front-end architecture where independent teams can work on different parts of the application.',
      boilerplate: {
        'host-app/package.json': `{ "name": "host-app", "dependencies": {} }`,
        'remote-app/package.json': `{ "name": "remote-app", "dependencies": {} }`,
      }
    },
    {
      id: 'orchestration',
      name: 'Multi-service Orchestration',
      icon: '⚙️',
      structure: 'my-orchestration-app/',
      tip: 'Use tools like Docker Compose or Kubernetes to manage multiple interconnected services.',
      boilerplate: {
        'docker-compose.yml': `version: '3.8'\nservices:\n  service1:\n    build: ./service1\n  service2:\n    build: ./service2`,
      }
    },
    {
      id: 'design-system',
      name: 'Design System',
      icon: '🎨',
      structure: 'my-design-system/',
      tip: 'A central source of truth for design tokens and UI components, documented with Storybook.',
      boilerplate: {
        '.storybook/main.js': `module.exports = { stories: ['../src/**/*.stories.js'] }`,
        'src/components/Button.jsx': `const Button = () => <button>Click me</button>;`,
      }
    },
  ],
  'mobile-desktop': [
    {
      id: 'react-native',
      name: 'React Native',
      icon: '📱',
      structure: 'my-rn-app/',
      tip: 'Build native mobile apps for iOS and Android using React.',
      boilerplate: {
        'package.json': `{ "name": "react-native-app", "dependencies": { "react-native": "^0.72.0" } }`,
        'App.js': `import { Text, View } from 'react-native';\nexport default function App() { return (<View><Text>Hello, Mobile!</Text></View>); }`,
      }
    },
    {
      id: 'flutter',
      name: 'Flutter',
      icon: '🐦',
      structure: 'my-flutter-app/',
      tip: 'Build natively compiled apps for mobile, web, and desktop from a single codebase.',
      boilerplate: {
        'pubspec.yaml': `name: my_flutter_app\ndependencies:\n  flutter:\n    sdk: flutter`,
        'lib/main.dart': `import 'package:flutter/material.dart';\nvoid main() => runApp(const MyApp());`,
      }
    },
    {
      id: 'electron',
      name: 'Electron',
      icon: '🖥️',
      structure: 'my-electron-app/',
      tip: 'Create cross-platform desktop applications with JavaScript, HTML, and CSS.',
      boilerplate: {
        'package.json': `{ "name": "electron-app", "dependencies": { "electron": "^28.0.0" } }`,
        'main.js': `const { app, BrowserWindow } = require('electron');\nconst createWindow = () => { new BrowserWindow(); };\napp.whenReady().then(() => { createWindow(); });`,
      }
    },
    {
      id: 'tauri',
      name: 'Tauri',
      icon: '🦀🖥️',
      structure: 'my-tauri-app/',
      tip: 'A Rust-based alternative to Electron for building smaller, more secure desktop apps.',
      boilerplate: {
        'src/main.rs': `fn main() { tauri::Builder::default().run(tauri::generate_context!()).expect("error while running tauri application"); }`,
      }
    },
  ],
};