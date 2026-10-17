# IgniteauthReferenceSystem

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.26.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


## STM32 Control Plane integration

Start IgAPI on `http://localhost:5249`, then run `npm install` and `npm start` from this directory. Angular's development proxy forwards `/api` to IgAPI. Sign in through the form; credentials are never stored by the frontend. The access token stays in session storage and is sent only to same-origin `/api` requests. Roles are taken from the backend session response.

The operation console loads subsystems and intent-command mappings from the reference-system endpoint, labels read-only and Admin operations, and displays a simulation-only console and recent session decisions. It executes a deterministic fixture only after an explicit matching `Allow` response. It does not operate actual hardware.

IgAPI issues a fresh CPC ID when the user requests authorization for a subsystem.
The frontend sends the operation without an ID, validates the positive ID returned
by the backend, and displays the most recently issued ID in the operation console.

Run `npm run build` and `npm test -- --watch=false --browsers=ChromeHeadless` to verify the frontend. Bootstrap 5 is installed as a project dependency.
