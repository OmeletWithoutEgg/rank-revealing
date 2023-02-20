# Rank Revealing for TIOJ ioicamp type contest

## Usage
- Extract data/contest.json and data/runs.json into `src/`. (use the one in tioj-spotboard)
    - See `src/data/example.contest.json`, `src/data/example.runs.json`.
- Then `PORT=3000 npm run start`.
- Enjoy rank revealing at `http://localhost:3000/?freeze_start_minute=180`.
  - The parameter `freeze_start_minute` is 180, which means the result of
      the runs (submissions) sent 180 minutes after the start of the contest
      will be hidden.
  - Press `Enter` key to reveal the results
- Or, `npm run build` with configured `PUBLIC_URL` and serve it with any preferred method.

## TODO
- [ ] Display `last_update` column.
- [ ] Blink before flipping the card.
- [ ] Display balloon picture.
- [ ] Add left sidebar.
      It was the total number of ACed problem in the original repo.
      Should we keep it or change it to `ceil(score / 100)`?
- [ ] Display more info, like title, time, freeze time, e.t.c.
- [ ] Make CSS Prettier.
- [ ] Set propTypes or use typescript.
- [ ] Show first blood of each problem
- [ ] Skip some revealing
- [ ] Parse and show award_slide.json
- [ ] Fetch data instead of `import from './data/xxxxxx.json';`.
- [ ] Set favicon.
- [ ] Document the data flow(?)
- [ ] Customize duration of flipping and climbing.

## Disclaimer
On old browser some animation might fail, e.g. smooth scrolling and table with `position: sticky`.

------

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
