import React from "react";
import {
    TrainingProgress,
} from "./common";
import { 
    Button,
    Form,
} from 'react-bootstrap';

import config from 'react-global-configuration';
import axios from "axios";

class TR_67 extends React.Component{
    constructor(props) {
        super(props);
    }

    state = {
        progress: 10
    }

    RunTrainingProcess() {
        console.log("Run training");

        /*var url = config.get("django_url") + "/training_helper/rest";

        axios
            .post(url, {
                params: {
                    req: "RUN_MODEL_TRAINING",
                    path: "/nas/blablab"
                }
            })
            .then((res) => {
                console.log(res)
            })
            .catch((err) => alert(err));*/
    }

    render() {
        return (
            <>
                <Form className='d-flex'>
                    <Button className="btn btn-primary btn-sm w-15" onClick={() => { this.RunTrainingProcess() }}>학습 개시</Button>
                    <TrainingProgress className="w-85" style={{height: 30, marginLeft: 5}} props={{now: this.state.progress}} />
                </Form>
            </>
        );
    }
}

export default TR_67;