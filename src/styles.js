import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({

    teamProblemAccepted : {
        backgroundColor: 'lightgreen',
    },

    teamProblemPartial : {
        backgroundColor: 'orange',
    },

    teamProblemTried : {
        backgroundColor: 'red',
    },

    teamProblemPending : {
        backgroundColor: 'lightblue',
    },

    teamProblem: {
        width: 70,
        height: 90,
        textAlign: 'center'
    },

    teamProblemCard: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
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

