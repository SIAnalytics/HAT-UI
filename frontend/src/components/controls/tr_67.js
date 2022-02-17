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

import {
    SetGraphData
} from './tr_8';

class TR_67 extends React.Component{
    static contextType = TrainerContext;

    constructor(props) {
        super(props);
        this.model_name = "";
        this.epoch_count = 0;
        this.training_parameters = {};
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

        if (Object.keys(data.scalars).length != 0) {
            SetGraphData(data.scalars);
        }

        this.setState(state);
    }

    async MonitorTrainingProcess(experiment_id, pid, log_path, epoch_count) {
        var last_epoch = 0;

        var do_continue = true;
        while (do_continue) {
            await this.timeout(3000);
            if (do_continue == false) {
                // Training already completed
                break;
            }
            // Get monitoring data from server
            var url = config.get("django_url") + config.get("training_helper_rest");
            
            axios
                .get(url, {
                    params: {
                        req: "GET_TRAINING_PROGRESS",
                        experiment_id: experiment_id,
                        pid: pid,
                        last_epoch: last_epoch,
                        log_path: log_path,
                        epoch_count: epoch_count,
                        model_name: this.model_name
                    }
                })
                .then((res) => {
                    var progress = res.data.progress;
                    console.log(res.data);

                    this.UpdateTrainingProgress(res.data);

                    last_epoch = res.data.last_epoch;
                    console.log(last_epoch);

                    if (progress >= 100) {
                        // Finish monitoring when training is completed
                        do_continue = false;
                    }

                    if (progress < 100 && res.data.alive == false) {
                        do_continue = false;
                        alert("[ERROR] Training completed abnormally. Monitoring will be stopped.");
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
        this.training_parameters = {};

        if (ret == false) {
            return;
        }

        data.append("req", "RUN_MODEL_TRAINING");

        axios
            .post(url, data)
            .then((res) => {
                var data = res.data;
                this.model_name = this.context.TrainerState.model_name;

                if (Object.keys(data).length == 0) {
                    alert("[ERROR] Failed to run trainig on server.");
                    return;
                }

                if (!("experiment_id" in data)) {
                    alert("[ERROR] Missing experiment_id from server");
                    return;
                }

                if (!("pid" in data)) {
                    alert("[ERROR] Missing pid from server");
                    return;
                }

                if (!("log_path" in data)) {
                    alert("[ERROR] Missing tensorboard log path from server");
                    return;
                }

                if (!("log_path" in data)) {
                    alert("[ERROR] Missing epoch_count from server");
                    return;
                }

                this.MonitorTrainingProcess(data.experiment_id, data.pid, data.log_path, data.epoch_count);
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