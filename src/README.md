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
- [ ] award_slide.json
