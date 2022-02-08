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

    GetTrainingParameters() {
        console.log("ADSDS");
    }

    timeout(delay) {
        return new Promise( res => setTimeout(res, delay) );
    }

    UpdateTrainingProgress(data) {
        console.log("UPDATE PROGRESS");
        // Set progress bar
        var state = {
            progress: data.progress
        }

        this.setState(state);
    }

    async MonitorTrainingProcess() {
        var do_continue = true;
        while (do_continue) {
            // Get monitoring data from server
            var url = config.get("django_url") + "/training_helper/rest";
            axios
                .get(url, {
                    params: {
                        req: "GET_TRAINING_PROGRESS"
                    }
                })
                .then((res) => {
                    var progress = res.data.progress;
                    
                    this.UpdateTrainingProgress(res.data);

                    if (progress >= 100) {
                        // Finish monitoring when training is completed
                        do_continue = false;
                    }
                })
                .catch((err) => {
                    alert(err);
                    return;
                });
            
            await this.timeout(1000);
        }
    }

    RunTrainingProcess() {
        console.log("Run training");

        var url = config.get("django_url") + "/training_helper/rest";
        let data = new FormData();

        this.GetTrainingParameters();
        data.append("req", "RUN_MODEL_TRAINING");
        data.append("path", "/nas/blablab");



        axios
            .post(url, data)
            .then((res) => {
                if (res.data == "SUCCESS") {
                    // Start training monitoring
                    this.MonitorTrainingProcess();
                } else {
                    alert("[ERROR] " + res.data);
                }
            })
            .catch((err) => alert(err));
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