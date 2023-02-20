import contestInfo from './data/contest.json';
import runsInfo from './data/runs.json';

const queryParameters = new URLSearchParams(document.location.search)
const freeze_start = queryParameters.get("freeze_start_minute")
  || (60 * 4 - 60) // An arbitrary default value: 60 minute before a 4-hour contest end


export function listenNextFeed(callbackFn) {
  const handleKeyDown = event => {
    if (event.key !== 'Enter') return;
    callbackFn();
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

const arraySum = arr => arr.reduce((a, b) => a + b, 0)
const arrayMax = arr => arr.reduce((a, b) => Math.max(a, b), -1)

function updateProblemWithSingleRun(team, problem, run) {
  let {
    score,
    penalty,
    penalty_tries,
    result,
    effective_submission_id,
    effective_submission_time,
  } = problem;
  let is_important = false;
  if (result === 'No') {
    if (run.result === 'Yes') {
      penalty = parseFloat(run.submissionTime) + penalty_tries * 20;
      result = 'Yes';
      is_important = true;
      effective_submission_id = run.id;
      effective_submission_time = parseFloat(run.submissionTime);
    } else if (result === 'No') {
      penalty_tries += 1;
      if (score < parseFloat(run.score)) {
        is_important = true;
        effective_submission_id = run.id;
        effective_submission_time = parseFloat(run.submissionTime);
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
    is_important,
    effective_submission_id,
    effective_submission_time,
  };
}

// event: {
//  submission_id,
//  submission_time,
//  problem_id, team_id,
//  score, penalty, penalty_tries, result
// }

export function updateWithSingleEvent(orgTeams, event) {
  const {
    submission_id,
    submission_time,
    problem_id,
    team_id,
    score,
    penalty,
    penalty_tries,
    result,
    is_final,
    effective_submission_id,
    effective_submission_time,
  } = event;
  const newTeams = reRank(orgTeams.map(team => {
    if (team.id !== team_id)
      return team;
    let { problem_details } = team;
    problem_details = problem_details.map(problem => {
      if (problem.id !== problem_id)
        return problem;
      return {
        ...problem,
        score,
        penalty,
        penalty_tries,
        result,
        is_final: is_final || problem.is_final,
        effective_submission_id,
        effective_submission_time,
      };
    });

    return {
      ...team,
      problem_details,
      is_final: problem_details.every(problem => problem.is_final),
    }
  }));

  return newTeams;
}

export function reRank(teams) {
  teams = teams.map(team => {
    const { problem_details } = team;
    const total_score   = arraySum(problem_details.map(problem => problem.score));
    const total_penalty = arraySum(problem_details.map(problem => problem.penalty));
    const total_solved  = arraySum(problem_details.map(problem => problem.result === 'Yes' ? 1 : 0));
    const last_effective_submission_id =
      arrayMax(problem_details.map(problem => problem.effective_submission_id));
    const last_effective_submission_time =
      arrayMax(problem_details.map(problem => problem.effective_submission_time));

    return {
      ...team,
      total_score,
      total_penalty,
      total_solved,
      last_effective_submission_id,
      last_effective_submission_time,
    };
  });

  teams = teams.sort((a, b) => {
    if (a.total_score !== b.total_score)
      return -(a.total_score - b.total_score);
    // if (a.total_penalty !== b.total_penalty)
    return a.total_penalty - b.total_penalty;
    // return a.last_effective_submission_time - b.last_effective_submission_time;
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
let { teams, problems } = contestInfo;

  const initialProblemDetails = problems.map(problem => ({
    id: problem.id,
    score: 0,
    penalty: 0,
    penalty_tries: 0,
    result: 'No',
    // update: 0,
    // TODO add this for consistence with TIOJ ioicamp style
    effective_submission_id: -1,
    effective_submission_time: 0,
  }));

  teams = teams.map(team => {
    return {
      problem_details: initialProblemDetails,
      total_score: 0,
      total_penalty: 0,
      total_solved: 0,
      // update: 0,
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
      let { problem_details } = team;

      problem_details = problem_details.map(problem => {
        if (problem.id !== run.problem)
          return problem;
        return updateProblemWithSingleRun(team, problem, run);
      });

      return {
        id: team.id,
        name: team.name,
        problem_details,
      };
    });
  }


  //// process the runs after freeze

  teams = teams.map(team => {
    let { problem_details } = team;
    problem_details = problem_details.map(problem => {
      const {
        score,
        penalty,
        penalty_tries,
        result,
        effective_submission_id,
        effective_submission_time
      } = problem;

      return {
        ...problem,
        hidden_results: [{
          score,
          penalty,
          penalty_tries,
          result,
          effective_submission_id,
          effective_submission_time,
          is_important: true,
        }],
      };
    });

    return {
      ...team,
      problem_details,
    }
  });

  for (let run of freezed_run) {
    teams = teams.map(team => {
      if (team.id !== run.team) return team;
      let { problem_details } = team;
      problem_details = problem_details.map(problem => {
        if (problem.id !== run.problem)
          return problem;
        let { hidden_results } = problem;
        const p = hidden_results[hidden_results.length - 1];
        hidden_results.push(updateProblemWithSingleRun(team, p, run));
        return {
          ...problem,
          hidden_results
        };
      });

      return {
        ...team,
        problem_details,
      };
    });
  }

  teams = teams.map(team => {
    let { problem_details } = team;
    problem_details = problem_details.map(problem => {
      const { hidden_results } = problem;
      let q = [...hidden_results];
      q[q.length - 1].is_important = true;
      q[q.length - 1].is_final = true; // ?
      const is_final = q.length === 1;
      return {
        ...problem,
        hidden_results: q,
        is_final,
      };
    });

    return {
      ...team,
      problem_details,
      is_final: problem_details.every(problem => problem.is_final),
    }
  });

  return teams;
}

// vim:ts=2:sts=2:sw=2
