// import logo from './logo.svg';
// import './App.css';

import React, { forwardRef, useState, useEffect } from 'react';
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

const RankingProblemCard = ({ targetIndex, problem }) => {
  const classes = useStyles();
  const M = problem.pending_queue.length;
  return (
    <FlippingCard duration={0.3} targetIndex={targetIndex}>
      {
        /*
          <div style={{ backgroundColor: 'red' }}>123</div>
          <div style={{ backgroundColor: 'green' }}>456</div>
          <div style={{ backgroundColor: 'blue' }}>789</div>
          <div style={{ backgroundColor: 'purple' }}>abc</div>
          */
      }

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

function RankingRow({ targetIndices, team }) {
  const classes = useStyles();
  return (
    <Flipped flipId={team.id} element={null} className={`team-${team.id}}`}>
      <tr>
        {/*<td className="team-total-solved">{team.total_solved}</td>*/}
        <td className={classes.teamRank}>{rankStr(team.rank)}</td>
        <td className={classes.teamName}>{team.name}</td>
        {
          team.problem_info.map((problem, i) => 
            <td key={problem.id}>
              <RankingProblemCard targetIndex={targetIndices[i]} problem={problem} />
            </td>
          )
        }
            <td className={classes.teamTotalScore}>
              {team.total_score}<small>&nbsp;pt.</small>
            </td>
            <td className={classes.teamTotalPenalty}>
              {team.total_penalty}
            </td>
            {/*
      <td className="team-balloons"></td>
      <td className="team-title">
        <span className="team-represents"></span>
        </td>
        */}
      </tr>
    </Flipped>
  )
}

function Ranking() {
  const [teams, setTeams] = useState(() => reRank(getInitialTeamsInfo()));
  const [targetIndices, setTargetIndices] = useState(() => {
    let initTargetIndices = {};
    for (let team of contestInfo.teams) {
      initTargetIndices[team.id] = contestInfo.problems.map(_ => 0);
    }
    return initTargetIndices;
  });

  const classes = useStyles();

  const flipOne = () => {
    const getLastPending = () => {
      for (let i = teams.length - 1; i >= 0; i--) {
        for (let j = 0; j < contestInfo.problems.length; j++) {
          if (targetIndices[teams[i].id][j] + 1 < teams[i].problem_info[j].pending_queue.length) {
            const team_id = teams[i].id;
            return [team_id, j];
          }
        }
      }
      throw new Error('builtin unreachable');
    };

    const [team_id, problem_position] = getLastPending();
    let teamTargetIndices = targetIndices[team_id];
    teamTargetIndices[problem_position] += 1;

    setTargetIndices({
      ...targetIndices,
      [team_id]: teamTargetIndices,
    });
  };

  const sortAll = () => {
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
    const handleKeyDown = event => {
      console.log(`Key: ${event.key} with keycode ${event.keyCode} has been pressed`);
      if (event.key === 'Enter') {
        flipOne();
      } else if (event.key === 's') {
        sortAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // <button onClick={() => setShowIndex(0)}>set 0</button>
  // <button onClick={() => setShowIndex(1)}>set 1</button>
  // <button onClick={() => setShowIndex(2)}>set 2</button>
  // <button onClick={() => setShowIndex(3)}>set 3</button>
  // <FlippingCard duration={0.3} targetIndex={showIndex}>
  // <div>0+1</div>
  // <div>50+2</div>
  // <div>60+3</div>
  // <div>80+4</div>
  // <div>90+5</div>
  // <div>100+6</div>
  // </FlippingCard>

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
          teams.map(team => (
            <RankingRow key={team.id} team={team} targetIndices={targetIndices[team.id]} />
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
