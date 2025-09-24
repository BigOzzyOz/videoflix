# FeVideoflix

This is the frontend for the Videoflix project, built with [Angular CLI](https://github.com/angular/angular-cli) version 19.2.12.

## Prerequisites

- [Node.js](https://nodejs.org/) (recommended: v18+)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/BigOzzyOz/fe_videoflix.git
   cd fe_videoflix
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Environment Variables

API endpoints and other environment-specific settings can be configured in:

- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

## Development server

To start a local development server, run:

```bash
ng serve
```

Navigate to [http://localhost:4200/](http://localhost:4200/). The app will automatically reload if you change any of the source files.

## Backend Connection

Make sure the backend ([be_videoflix](https://github.com/BigOzzyOz/be_videoflix)) is running and the API URL is correctly set in the environment files.

## Code scaffolding

To generate a new component:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`):

```bash
ng generate --help
```

## Building

To build the project:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory. For a production build:

```bash
ng build --configuration production
```

## Deployment

After building, deploy the contents of the `dist/fe_videoflix` folder to your web server or static hosting provider (e.g., Netlify, Vercel, GitHub Pages).

## 🚀 GitHub Actions: Build, Test & FTP Deploy

This project uses an automated workflow for pull requests to the `prod` and `main` branches.  
The workflow runs tests, builds the project, and deploys the build to your FTP server.

### 🔑 Required GitHub Secrets

To enable FTP deployment, add the following secrets to your repository:

- `FTP_HOST` – Hostname or IP address of your FTP server (e.g., `ftp.yourserver.com`)
- `FTP_USERNAME` – FTP username
- `FTP_PASSWORD` – FTP password

**How to add secrets:**

1. Go to your repository on GitHub.
2. Click on `Settings` → `Secrets and variables` → `Actions`.
3. Click `New repository secret`.
4. Enter the name and value for each secret, then save.

### ⚙️ Workflow Details

- On every pull request to `prod` or `main`:
  - Runs unit tests in Chrome Headless mode.
  - Builds the project.
  - Deletes all files in the FTP folder `videoflix`.
  - Uploads the new build from `dist/fe-videoflix/browser/` to your FTP server.

### 📁 FTP Target Directory

Build files are uploaded to  
`videoflix`  
on your FTP server.  
Adjust the path in `.github/workflows/deploy.yml` if needed.

---

**Note:**  
FTP credentials are stored securely as GitHub Secrets and are only visible to repository administrators.

## Running unit tests

To execute unit tests with [Karma](https://karma-runner.github.io):

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing:

```bash
ng e2e
```

> Note: Angular CLI does not include an end-to-end testing framework by default. You can use tools like Cypress or Playwright.

## Linting

To check code quality:

```bash
ng lint
```

## Project Structure

- `src/app/` – Main application source code
- `src/environments/` – Environment-specific configuration
- `src/assets/` – Static assets (images, styles, etc.)

## Troubleshooting

- If you encounter CORS issues, ensure the backend allows requests from `localhost:4200`.
- Make sure ports used by backend and frontend do not conflict.

## Additional Resources

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Videoflix Backend Repository](https://github.com/BigOzzyOz/be_videoflix)

---

**License:** MIT
