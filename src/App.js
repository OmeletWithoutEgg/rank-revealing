import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import { useStyles } from './styles.js';
import { FlippingCard } from './FlippingCard.js';
import {
  listenNextFeed,
  getInitialTeamsInfo,
  reRank,
  updateWithSingleEvent 
} from './Control.js';

import contestInfo from './data/contest.json';

// Partially polyfill findLastIndex for qutebrowser.
// Although it seems that position: sticky and smooth
// scrolling is not working in qutebrowser...
if (!Array.prototype.findLastIndex) {
  // eslint-disable-next-line
  Array.prototype.findLastIndex = function(pred) {
    if (typeof pred !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    for (let i = this.length - 1; i >= 0; i--) {
      if (pred(this[i])) {
        return i;
      }
    }
    return -1;
  }
}

function RankingProblemCard({ problem, onRevealed, isActive }) {
  const classes = useStyles();
  const faces = problem.hidden_results.map(p => ({
      ...p,
      isImportantFace: p.is_important,
      onFlippingComplete: () => { onRevealed(p); },
    }));

  const renderFace = (p) => {
    let classNames = [ classes.teamProblemCard, classes.teamProblem ]
    if (p.result === 'Yes') {
      classNames.push(classes.teamProblemAccepted)
    } else if (p.pending_tries > 0) {
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
      <div className={classNames.join(' ')}>
        <span>
          {p.score}/
          <small>
            {p.result === 'Yes' ? '+' : '-'}{p.penalty_tries}
          </small>
          {/* <br /> */}
          {/* <small> */}
          {/*   @{p.effective_submission_time} */}
          {/* </small> */}
          {
            p.pending_tries === 0 ? null :
              <>
              <br />
              <small>{`? +${p.pending_tries}`}</small>
              </>
          }
        </span>
      </div>
    );
  };

  return (
    <FlippingCard
      duration={0.5}
      faces={faces}
      isActive={isActive}
      renderFace={renderFace}
    />
  )
}

function RankingRow({ team, onRevealed, onClimbComplete, onNoClimb }) {
  const classes = useStyles();
  const ref = useRef(null);
  const classNames = [classes.stickyRow];
  if (team.revealStatus === 'revealed') {
    classNames.push(classes.teamRowRevealed);
  } else if (team.revealStatus === 'revealing') {
    classNames.push(classes.teamRowRevealing);
  }

  useEffect(() => {
    if (ref.current && team.revealStatus === 'revealing') {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [team.revealStatus]);

  useEffect(() => {
    if (team.revealStatus !== 'revealing')
      return;
    if (!team.is_final)
      return;
    return listenNextFeed(onNoClimb);
  }, [team.revealStatus, team.is_final, onNoClimb]);

  const revealingProblem =
    team.problem_details.find(problem => problem.is_final === false);

  return (
    <motion.tr
      ref={ref}
      className={classNames.join(' ')}
      layout
      onLayoutAnimationComplete={onClimbComplete}
    >
      {/*<td className="team-total-solved">{team.total_solved}</td>*/}
      <td className={classes.teamRank}>#{team.rank}</td>
      <td className={classes.teamName}>{team.name}</td>
      {
        team.problem_details.map(problem =>  {
          const onSingleRevealed = updatedProblem => {
            const event = {
              ...updatedProblem,
              problem_id: problem.id,
              team_id: team.id,
            };
            onRevealed(event);
          };
          const isActive =
            team.revealStatus === 'revealing' &&
            problem.id === revealingProblem?.id;
          return (
            <td key={problem.id}>
            <RankingProblemCard
              problem={problem}
              isActive={isActive}
              onRevealed={onSingleRevealed}
            />
            </td>
          );
        })
      }
      <td className={classes.teamTotalScore}>
        {team.total_score}<small>&nbsp;pt.</small>
      </td>
      <td className={classes.teamTotalPenalty}>
        {team.total_penalty}
        {/* {team.last_effective_submission_time} */}
      </td>
      {/* <td className="team-balloons"></td> */}
      {/* <td className="team-title"> */}
      {/*   <span className="team-represents"></span> */}
      {/* </td> */}
    </motion.tr>
  );
}

function updateLastRevealing(teams) {
  const last = teams.findLastIndex(team => team.revealStatus !== 'revealed');
  return teams.map((team, i) => {
    const revealStatus =
      i > last ? 'revealed' :
      i === last ? 'revealing' : 'notYetChecked';
    return {
      ...team,
      revealStatus,
    };
  });
};

function Ranking() {
  const classes = useStyles();
  const [teams, setTeams] = useState(() => 
    updateLastRevealing(reRank(getInitialTeamsInfo()))
  );

  // const N = teams.length;
  const classNames = [classes.root, classes.stickyHead];

  const onClimbComplete = () => {
    setTeams(updateLastRevealing);
  };

  const onNoClimb = () => {
    setTeams(oldTeams => {
      const t = oldTeams.map(team => {
        let { revealStatus } = team;
        if (revealStatus === 'revealing')
          revealStatus = 'revealed';
        return {
          ...team,
          revealStatus,
        };
      });
      return updateLastRevealing(t);
    });
  };

  const onRevealed = (event) => {
    setTeams(oldTeams => updateWithSingleEvent(oldTeams, event));
  };

  return (
    <table className={classNames.join(' ')} cellSpacing="0">
      <thead>
        {/* <tr> */}
        {/*   <th colSpan={100} style={{ top: 30 }}> */}
        {/*     <h1 id="contest-title">{contestInfo.title}</h1> */}
        {/*   </th> */}
        {/* </tr> */}
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
      <tbody>
        {
          teams.map((team, i) => (
            <RankingRow
              key={team.id}
              team={team}
              onRevealed={onRevealed}
              onClimbComplete={onClimbComplete}
              onNoClimb={onNoClimb}
            />
          ))
        }
      </tbody>
    </table>
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
