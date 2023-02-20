import { createUseStyles } from "react-jss";

export const useStyles = createUseStyles({

    teamProblemAccepted : {
        backgroundColor: 'lightgreen',
        // background: 'rgb(22,121,9)',
        // background: 'linear-gradient(90deg, rgba(22,121,9,1) 0%, rgba(123,255,0,1) 100%)',
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
        textAlign: 'center'
    },

    teamTotalPenalty: {
        width: 70,
        textAlign: 'center'
    },

    root: {
        width: '100%',
        "& thead": {
            "& tr": { height: 30 },
        },
        "& tbody": {
            "& tr, & div": { height: 90 },
        }
    },

    stickyHead: {
        overflow: 'auto',
        "& thead": {
            "& th": {
                position: 'sticky',
                top: 0,
                zIndex: 1,
                backgroundColor: '#32cd32',
                color: 'white',
            },
        }
    },

});

