import React, { useReducer } from "react";
import { 
    TR_1,
    TR_5,
    TR_8,
    TR_9,
    TR_67,
    TR_234,
} from "./controls";
import {
    Container,
    Row,
} from "react-bootstrap"

import {
    TrainerContext,
    TrainerProvider
} from "./TrainerContext";

/*
function reducer(state, action) {
    switch (action.type) {
        case 'UPDATE_DATSET_PATH':
            return {
                dataset_path: action.data
            };
        default:
            return TrainerState;
    }
}*/

function TrainerHelper() {
    //const [state, dispatch] = useReducer(reducer, TrainerState);
    const TrainerState = {
        dataset_path: "",
        model_name: "",
        model_path: "",
        random_flag: false,
        hyper_parameters: [

        ],
        hyper_default_flag: false
    };

    return(
        <Container>
            <TrainerProvider value={{ TrainerState }}>
                <Row>
                    <div className="col-md-6">
                        <div className="options-content">
                            <TR_1 />
                        </div>
                    </div>
                    <div className="col-md-6">

                    </div>
                </Row>
                <Row>
                    <div className="col-md-6">
                        <div className="options-content" style={{height:290}}>
                            <TR_234 />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="options-content" style={{height:290}}>
                            <TR_5 />
                        </div>
                    </div>
                </Row>
                <Row>
                    <div className="col-md-1"></div>
                    <div className="col-md-8">
                        <div className="options-content">
                            <TR_67 />
                        </div>
                    </div>
                    <div className="col-md-1"></div>
                </Row>
                <Row>
                    <div className="col-md-6">
                        <div className="options-content" style={{height:230}}>
                            <TR_8 />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="options-content" style={{height:230}}>  
                            <TR_9 />
                        </div>
                    </div>
                </Row>
            </TrainerProvider>
        </Container>
    );
}

export default TrainerHelper;