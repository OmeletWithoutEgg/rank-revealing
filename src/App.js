// import logo from './logo.svg';
// import './App.css';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import { FlippingCard } from './FlippingCard.js';
import { useStyles } from './styles.js';
import { getInitialTeamsInfo, reRank, updateWithSingleEvent } from './ranking.js';

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

const rankStr = rank => {
  if (rank % 10 === 1 && rank % 100 !== 11) {
    return rank + "st";
  } else if (rank % 10 === 2 && rank % 100 !== 12) {
    return rank + "nd";
  } else if (rank % 10 === 3 && rank % 100 !== 13) {
    return rank + "rd";
  } else {
    return rank + "th";
  }
};

function RankingProblemCard({ problem, onRevealed, isActive }) {
  const classes = useStyles();
  const M = problem.hidden_results.length;
  const faces = problem.hidden_results.map((p, i) => {
    return {
      ...p,
      pending_tries: M - i - 1,
      isImportantFace: p.isImportant,
      onFlippingComplete: () => {
        let q = { ...p };
        q.pending_tries = M - i - 1;
        onRevealed(q);
      },
    };
  });

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

function RankingRow(props) {
  const {
    team,
    onRevealed,
    onClimbComplete,
    onNoClimb,
  } = props;
  const classes = useStyles();
  const ref = useRef(null);
  const backgroundColor =
    team.revealStatus === 'revealed' ? '#ccccff' :
    team.revealStatus === 'revealing' ? '#aaaaff' : null
  const trStyle = {
    position: 'sticky',
    top: -100,
    backgroundColor,
  };

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
    if (!team.isFinal)
      return;
    const handleKeyDown = event => {
      if (event.key === 'Enter') {
        onNoClimb();
        return;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [team.revealStatus, team.isFinal, onNoClimb]);

  const revealingProblem =
    team.problem_details.find(problem => problem.isFinal === false);

  return (
    <motion.tr
      ref={ref}
      style={trStyle}
      layout
      onLayoutAnimationComplete={onClimbComplete}
    >
      {/*<td className="team-total-solved">{team.total_solved}</td>*/}
      <td className={classes.teamRank}>{rankStr(team.rank)}</td>
      <td className={classes.teamName}>{team.name}</td>
      {
        team.problem_details.map((problem, i) =>  {
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
