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

import { TrainerContext } from '../TrainerContext';

class TR_67 extends React.Component{
    static contextType = TrainerContext;

    constructor(props) {
        super(props);
    }

    state = {
        progress: 0
    }

    SetTrainingParameters(data) {
        if (this.context.TrainerState.dataset_path == "") {
            alert("Dataset path must be specified");
            return false;
        }
        data.append("dataset_path", this.context.TrainerState.dataset_path);

        if (this.context.TrainerState.model_name == "") {
            alert("Model must be selected");
            return false;
        }
        data.append("model_name", this.context.TrainerState.model_name);

        if (this.context.TrainerState.model_path == "") {
            alert("Model path must be specified");
            return false;
        }
        data.append("model_path", this.context.TrainerState.model_path)

        data.append("hyper_parameters", JSON.stringify(this.context.TrainerState.hyper_parameters));
        data.append("random_flag", this.context.TrainerState.random_flag);
        data.append("hyper_default_flag", this.context.TrainerState.hyper_default_flag);

        return true;
    }

    timeout(delay) {
        return new Promise( res => setTimeout(res, delay) );
    }

    UpdateTrainingProgress(data) {
        // Set progress bar
        var state = {
            progress: data.progress
        }

        this.setState(state);
    }

    async MonitorTrainingProcess() {

        var do_continue = true;
        while (do_continue) {
            await this.timeout(3000);
            // Get monitoring data from server
            var url = config.get("django_url") + config.get("training_helper_rest");
            
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
        }
    }

    RunTrainingProcess() {
        var url = config.get("django_url") + config.get("training_helper_rest");
        let data = new FormData();

        var ret = this.SetTrainingParameters(data);

        if (ret == false) {
            return;
        }

        data.append("req", "RUN_MODEL_TRAINING");

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