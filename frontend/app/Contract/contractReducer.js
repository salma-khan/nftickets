const contractContextReducer = (state, action) => {

    const logs = action.payload.logs;


    if (action.type === CONTRACT_ACTION && logs.length > 0) {


        for (let log of logs) {

            switch (log.eventName) {
                
                case 'EventCreated':
                    let contractAddr =log.args.ticketAddress;
                    console.log(contractAddr);
                    state.eventAddress = contractAddr;
                    break;

               

        }
    }

        return {


            ...state,

        };
    }


    return state;
}

export default contractContextReducer;

export const CONTRACT_ACTION = 'contract_action';