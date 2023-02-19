# Rank Revealing for TIOJ ioicamp type contest

## Usage
- Extract data/contest.json and data/runs.json. (use the one in tioj-spotboard)
- Then `PORT=3000 npm run start`.
- Or, `npm run build` with configured `PUBLIC_URL`.

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
