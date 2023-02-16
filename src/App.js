// import logo from './logo.svg';
// import './App.css';

import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { Flipper, Flipped } from 'react-flip-toolkit'

import { FlippingCard } from './FlippingCard.js';

import { useStyles } from './styles.js';
import { getInitialTeamsInfo, reRank } from './ranking.js';
import contestInfo from './data/contest.json';

const rankStr = rank => {
  rank %= 100;
  if (rank % 10 === 1 && rank !== 11) {
    return rank + "st";
  } else if (rank % 10 === 2 && rank !== 12) {
    return rank + "nd";
  } else if (rank % 10 === 3 && rank !== 13) {
    return rank + "rd";
  } else {
    return rank + "th";
  }
};

const RankingProblemCard = ({ targetIndex, problem, onFlipComplete }) => {
  const classes = useStyles();
  const M = problem.pending_queue.length;
  return (
    <FlippingCard duration={0.5} targetIndex={targetIndex} onFlipComplete={onFlipComplete}>
      {/* <div style={{ backgroundColor: 'red' }}>123</div> */}
      {/* <div style={{ backgroundColor: 'green' }}>456</div> */}
      {/* <div style={{ backgroundColor: 'blue' }}>789</div> */}
      {/* <div style={{ backgroundColor: 'purple' }}>abc</div> */}

      {
        problem.pending_queue.map((p, i) => {
          let classNames = [ classes.teamProblemCard, classes.teamProblem ]
          if (p.result === 'Yes') {
            classNames.push(classes.teamProblemAccepted)
          } else if (i + 1 < problem.pending_queue.length) {
            classNames.push(classes.teamProblemPending)
            // classNames.push('blink-element')
            // classNames.push('rotate-element')
          } else if (p.score > 0) {
            classNames.push(classes.teamProblemPartial)
          } else if (p.penalty_tries > 0) {
            classNames.push(classes.teamProblemAttempted)
          } else {
            // return <div></div> // is this required?
          }
          return (
            <div key={i} className={classNames.join(' ')}>
              <span>
              {p.score}/<small>{p.result === 'Yes' ? '+' : '-'}{p.penalty_tries}</small>
              {
                M - i === 1 ? null :
                  <>
                  <br />
                  <small>{`? +${M - i - 1}`}</small>
                  </>
              }
              </span>
            </div>
          );
        })
      }
    </FlippingCard>
  )
}

const RankingRow = forwardRef((props, ref) => {
  const {
    revealStatus,
    onTranslateComplete,
    onFlipComplete,
    targetIndices,
    team
  } = props;
  const classes = useStyles();
  const backgroundColor =
    revealStatus === 'revealed' ? '#ccccff' :
    revealStatus === 'revealing' ? '#aaaaff' : null
  return (
    <Flipped flipId={team.id} element={null} className={`team-${team.id}}`} onComplete={onTranslateComplete}>
      <tr ref={ref} style={{ backgroundColor }}>
        {/*<td className="team-total-solved">{team.total_solved}</td>*/}
        <td className={classes.teamRank}>{rankStr(team.rank)}</td>
        <td className={classes.teamName}>{team.name}</td>
        {
          team.problem_info.map((problem, i) => 
            <td key={problem.id}>
              <RankingProblemCard
                targetIndex={targetIndices[i]}
                problem={problem}
                onFlipComplete={onFlipComplete}
              />
            </td>)
        }
        <td className={classes.teamTotalScore}>
          {team.total_score}<small>&nbsp;pt.</small>
        </td>
        <td className={classes.teamTotalPenalty}>
          {team.total_penalty}
        </td>
        {/* <td className="team-balloons"></td> */}
        {/* <td className="team-title"> */}
        {/*   <span className="team-represents"></span> */}
        {/* </td> */}
      </tr>
    </Flipped>
  )
})

function getLastPending(teams, targetIndices, revealedCount) {
  for (let i = teams.length - 1 - revealedCount; i >= 0; i--) {
    for (let j = 0; j < contestInfo.problems.length; j++) {
      const que = teams[i].problem_info[j].pending_queue;
      let idx = targetIndices[teams[i].id][j] + 1;
      if (idx < que.length) {
        // console.log(que);
        while (idx < que.length && que[idx].isImportant === false) {
          idx += 1;
        }
        return [i, j, idx];
      }
    }
    return [i, null, null];
  }
  throw new Error('unreachable');
}

function Ranking() {
  const classes = useStyles();
  const [teams, setTeams] = useState(() => reRank(getInitialTeamsInfo()));
  const [targetIndices, setTargetIndices] = useState(() => {
    let initTargetIndices = {};
    for (let team of contestInfo.teams) {
      initTargetIndices[team.id] = contestInfo.problems.map(_ => 0);
    }
    return initTargetIndices;
  });
  const [revealedCount, setRevealedCount] = useState(0);

  const lastPending = getLastPending(teams, targetIndices, revealedCount);
  const lastPendingRef = useRef(null);

  const scrollLastPendingIntoView = () => {
    if (lastPendingRef.current) {
      lastPendingRef.current.scrollIntoView({behavior: 'smooth', block: 'center'})
    }
  };

  const sortAll = () => {
    console.log('sortAll');
    setTeams(teams => {
      teams = teams.map(team => {
        let { problem_info } = team;
        problem_info = problem_info.map((problem, j) => {
          const { pending_queue } = problem;
          const targetIndex = targetIndices[team.id][j];
          const {
            score,
            penalty,
            penalty_tries,
            result,
          } = pending_queue[targetIndex];
          return {
            ...problem,
            score,
            penalty,
            penalty_tries,
            result,
          }
        });
        return {
          ...team,
          problem_info,
        };
      });
      return reRank(teams);
    });
  };

  useEffect(() => {
    const flipOne = () => {
      scrollLastPendingIntoView();

      const [team_position, problem_position, queue_position] = lastPending;
      if (problem_position === null) {
        setRevealedCount(revealedCount + 1);
        return;
      }
      const team_id = teams[team_position].id;
      let teamTargetIndices = targetIndices[team_id];
      teamTargetIndices[problem_position] = queue_position;

      setTargetIndices({
        ...targetIndices,
        [team_id]: teamTargetIndices,
      });
    };

    const handleKeyDown = event => {
      // console.log(`Key: ${event.key} with keycode ${event.keyCode} has been pressed`);
      if (event.key === 'Enter') {
        flipOne();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [teams, targetIndices, lastPending, revealedCount]);

  useEffect(() => {
    scrollLastPendingIntoView();
  }, [lastPending]);


  return (
    <>
    <div id="header">
      <span id="clock-icon" className="icon"></span>
      <span id="feed-one-icon" className="icon hoverable"></span>
      <h1 id="contest-title">{contestInfo.title}</h1>
    </div>
    <table>
      <thead>
        <tr>
          <th className={classes.teamRank}>Rank</th>
          <th className={classes.teamName}>Participant</th>
          {
            contestInfo.problems.map(problem => 
              <th key={problem.id} className={classes.teamProblem}>{problem.name}</th>
            )
          }
          <th className={classes.teamTotalScore}>Score</th>
          <th className={classes.teamTotalPenalty}>Penalty</th>
        </tr>
      </thead>
      <Flipper flipKey={teams.map(team => team.id)} element="tbody">
        {
          teams.map((team, i) => (
            <RankingRow
              key={team.id}
              team={team}
              ref={i === lastPending[0] ? lastPendingRef : null}
              onTranslateComplete={scrollLastPendingIntoView}
              onFlipComplete={sortAll}
              targetIndices={targetIndices[team.id]}
              revealStatus={i > lastPending[0] ? 'revealed' : i === lastPending[0] ? 'revealing' : 'unrevealed'}
            />
          ))
        }
      </Flipper>
    </table>
    </>
  );
};

function App() {
  return (
    <div className="App">
      <Ranking />
    </div>
  )
}

export default App;

// vim:ts=2:sts=2:sw=2
