import contestInfo from './data/contest.json';
import runsInfo from './data/runs.json';

let { teams, problems } = contestInfo;

const sum = arr => arr.reduce((a, b) => a + b, 0)

const freeze_start = 60 * 4 - 60; // 60 minute before contest end

function updateProblemWithSingleRun(team, problem, run) {
  let {
    score,
    penalty,
    penalty_tries,
    result,
  } = problem;
  let isImportant = false;
  if (result === 'No') {
    if (run.result === 'Yes') {
      penalty = parseFloat(run.submissionTime) + penalty_tries * 20;
      result = 'Yes';
      isImportant = true;
    } else if (result === 'No') {
      penalty_tries += 1;
      if (score < parseFloat(run.score)) {
        isImportant = true;
      }
    }
  }
  score = Math.max(score, parseFloat(run.score));
  return {
    ...problem,
    score,
    penalty,
    penalty_tries,
    result,
    isImportant,
    last_submission_id: run.id,
  };
}

// event: { problem_id, team_id, score, penalty, penalty_tries, result }
export function updateWithSingleEvent(orgTeams, event) {
  const {
    problem_id,
    team_id,
    score,
    penalty,
    penalty_tries,
    result,
    isFinal,
  } = event;
  const newTeams = reRank(orgTeams.map(team => {
    if (team.id !== team_id)
      return team;
    let { problem_info } = team;
    problem_info = problem_info.map(problem => {
      if (problem.id !== problem_id)
        return problem;
      return {
        ...problem,
        score,
        penalty,
        penalty_tries,
        result,
        isFinal,
      };
    });

    return {
      ...team,
      problem_info,
      isFinal: problem_info.every(problem => problem.isFinal),
    }
  }));

  return newTeams;
}

export function reRank(teams) {
  teams = teams.map(team => {
    const { problem_info } = team;
    const total_score   = sum(problem_info.map(problem => problem.score));
    const total_penalty = sum(problem_info.map(problem => problem.penalty));
    const total_solved  = sum(problem_info.map(problem => problem.result === 'Yes' ? 1 : 0));

    return {
      ...team,
      total_score,
      total_penalty,
      total_solved,
    };
  });

  teams = teams.sort((a, b) => {
    if (a.total_score !== b.total_score)
      return -(a.total_score - b.total_score);
    return a.total_penalty - b.total_penalty;
  });

  // add rank
  teams = teams.map((team, index) => {
    return {
      ...team,
      rank: index + 1,
    }
  });

  return teams;
}

// get teams info before freezing
export function getInitialTeamsInfo() {

  const initialProblemInfo = problems.map(problem => ({
    id: problem.id,
    score: 0,
    penalty: 0,
    penalty_tries: 0,
    result: 'No',
    // last_update: 0,
    // TODO add this for consistence with TIOJ ioicamp style
    last_submission_id: -1,
  }));

  teams = teams.map(team => {
    return {
      problem_info: initialProblemInfo,
      total_score: 0,
      total_penalty: 0,
      total_solved: 0,
      // last_update: 0,
      ...team
    }
  });

  let freezed_run = [];

  for (let run of runsInfo.runs) {
    if (parseFloat(run.submissionTime) > freeze_start) {
      freezed_run.push(run);
      continue;
    }
    teams = teams.map(team => {
      if (team.id !== run.team) return team;
      let { problem_info } = team;

      problem_info = problem_info.map(problem => {
        if (problem.id !== run.problem)
          return problem;
        return updateProblemWithSingleRun(team, problem, run);
      });

      return {
        id: team.id,
        name: team.name,
        problem_info,
      };
    });
  }


  //// process the runs after freeze

  teams = teams.map(team => {
    let { problem_info } = team;
    problem_info = problem_info.map(problem => {
      const {
        score,
        penalty,
        penalty_tries,
        result,
      } = problem;

      return {
        ...problem,
        pending_queue: [{
          score,
          penalty,
          penalty_tries,
          result,
          isImportant: true,
        }],
      };
    });

    return {
      ...team,
      problem_info,
    }
  });

  for (let run of freezed_run) {
    teams = teams.map(team => {
      if (team.id !== run.team) return team;
      let { problem_info } = team;
      problem_info = problem_info.map(problem => {
        if (problem.id !== run.problem)
          return problem;
        let { pending_queue } = problem;
        const p = pending_queue[pending_queue.length - 1];
        pending_queue.push(updateProblemWithSingleRun(team, p, run));
        return {
          ...problem,
          pending_queue
        };
      });

      return {
        ...team,
        problem_info,
      };
    });
  }

  teams = teams.map(team => {
    let { problem_info } = team;
    problem_info = problem_info.map(problem => {
      const { pending_queue } = problem;
      let q = [...pending_queue];
      q[q.length - 1].isImportant = true;
      q[q.length - 1].isFinal = true; // ?
      const isFinal = q.length === 1;
      return {
        ...problem,
        pending_queue: q,
        isFinal,
      };
    });

    return {
      ...team,
      problem_info,
      isFinal: problem_info.every(problem => problem.isFinal),
    }
  });

  return teams;
}

// vim:ts=2:sts=2:sw=2
