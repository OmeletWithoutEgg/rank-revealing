import { createUseStyles } from "react-jss";

const style_gradient = {
    teamProblemAccepted : {
        background: 'linear-gradient(0deg, rgba(22,121,9,1) 0%, rgba(123,255,0,1) 100%)',
        color: 'white',
    },

    teamProblemPartial : {
        background: 'linear-gradient(0deg, rgba(125,79,54,1) 0%, rgba(255,173,0,1) 100%)',
    },

    teamProblemAttempted : {
        background: 'linear-gradient(0deg, rgba(125,79,54,1) 0%, rgba(255,36,0,1) 100%)',
    },

    teamProblemPending : {
        background: 'linear-gradient(0deg, rgba(71,85,106,1) 0%, rgba(148,228,233,1) 100%)',
    },
};

const style_flat = {
    teamProblemAccepted : {
        backgroundColor: 'lightgreen',
    },
    teamProblemPartial : {
        background: 'orange',
    },
    teamProblemAttempted : {
        background: 'red',
    },
    teamProblemPending : {
        background: 'lightblue',
    },
};

export const useStyles = createUseStyles({
    teamRowRevealing: {
        backgroundColor: '#aaaaff',
    },

    teamRowRevealed: {
        backgroundColor: '#ccccff',
    },

    teamRowNotYetChecked: {
        backgroundColor: '#E6EBF0',
    },

    ...style_flat,

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
        },
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

    stickyRow: {
        position: 'sticky',
        top: -100,
    },

});

