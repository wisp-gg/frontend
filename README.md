# Game Panel Frontend

[![Crowdin](https://badges.crowdin.net/wisp-game-panel/localized.svg)](https://crowdin.com/project/wisp-game-panel)

At the moment, this repository functions as a public issue tracker for known issues, and at a later date can be used to modify the game panel's frontend completely (though to be decided later on). How to run this locally, etc. isn't something we currently will provide support for, and this should be treated purely as a reference for CSS modifications for now.

## Developers

Requirements:
- An instance to point your local frontend at. If you haven't already got one, ask for one.
- Linux environment with npm.

Setup:
1. Copy .env.example to .env & change the URL to your instance.
2. Run "npm install"
3. To run a development instance run npm run dev
4. To run a production build run the run-prod.sh file

Common issues:
- You'll need to disable CORS on your browser. I use this [extension](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino) & limit its access to the local webserver address so CORS still works on other sites.
- Make sure you enable third party cookies in your browser for the local webserver address.

## Translating

The locale strings can be found inside of `src/locales/*` but any new language should not be pull requested directly and should be done through our localization platform instead. You can find more info in our [Discord](https://wisp.gg/discord).  
