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
};