import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({

    teamProblemAccepted : {
        backgroundColor: 'lightgreen',
        borderRadius: '4px',
    },

    teamProblemPartial : {
        backgroundColor: 'orange',
        borderRadius: '4px',
    },

    teamProblemTried : {
        backgroundColor: 'red',
        borderRadius: '4px',
    },

    teamProblemPending : {
        backgroundColor: 'lightblue',
        borderRadius: '4px',
    },

    teamProblem: {
        width: 70,
        height: 90,
        textAlign: 'center'
    },

    teamRank: {
        textAlign: 'center'
    },

    teamName: {
        textAlign: 'left'
    },

    teamTotalScore: {
        width: 70,
        height: 90,
        textAlign: 'center'
    },

    teamTotalPenalty: {
        width: 70,
        height: 90,
        textAlign: 'center'
    },

});

