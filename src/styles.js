import { createUseStyles } from "react-jss";

export const useStyles = createUseStyles({

    teamProblemAccepted : {
        backgroundColor: 'lightgreen',
    },

    teamProblemPartial : {
        backgroundColor: '#ff3300',
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

