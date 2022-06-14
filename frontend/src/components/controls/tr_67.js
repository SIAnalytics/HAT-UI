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

class TR_67 extends React.Component {
    static contextType = TrainerContext;

    constructor(props) {
        super(props);
        this.model_name = "";
        this.epoch_count = 0;
        this.training_parameters = {};
    }

    state = {
        disabled: false,
        progress: 0,
        progress_label: 0,
        style: {
            variant: "success",
            animated: true
        }
    }

    SetTrainingParameters(data) {
        if (this.context.TrainerState.dataset_path == "") {
            alert("데이터셋 경로를 지정해주세요");
            return false;
        }
        data.append("dataset_path", this.context.TrainerState.dataset_path);

        if (this.context.TrainerState.model_name == "") {
            alert("모델을 선택해주세요");
            return false;
        }
        data.append("model_name", this.context.TrainerState.model_name);

        if (this.context.TrainerState.model_path == "" && this.context.TrainerState.random_flag == false) {
            alert("모델 경로를 선택해주세요");
            return false;
        }
        data.append("model_path", this.context.TrainerState.model_path)

        data.append("hyper_parameters", JSON.stringify(this.context.TrainerState.hyper_parameters));
        data.append("random_flag", this.context.TrainerState.random_flag);
        data.append("hyper_default_flag", this.context.TrainerState.hyper_default_flag);

        return true;
    }

    timeout(delay) {
        return new Promise(res => setTimeout(res, delay));
    }

    UpdateProgressBar(type, progress) {
        var state = {
            style: {
            }
        }

        switch (type) {
            case "processing": {
                state.progress = progress;
                state.progress_label = progress.toString() + " %";
                state.style.variant = "success";
                state.style.animated = true;
                state.disabled = true;
                break;
            }
            case "completed": {
                state.progress = progress;
                state.progress_label = progress.toString() + " %";
                state.style.variant = "";
                state.style.animated = false;
                state.disabled = false;
                break;
            }
            case "failed": {
                state.progress = progress;
                state.progress_label = progress.toString() + " %";
                state.style.variant = "danger";
                state.style.animated = false;
                state.disabled = false;
                break;
            }
            case "initializing": {
                state.progress_label = "Initializing";
                state.progress = 100;
                state.style.variant = "warning";
                state.style.animated = true;
                state.disabled = false;
                break;
            }
            default: {
                break;
            }
        }

        this.setState(state);
    }

    UpdateTrainingProgress(data) {
        // Set progress bar
        this.UpdateProgressBar("processing", data.progress);

        if (Object.keys(data.scalars).length != 0) {
            SetGraphData(data.scalars);
        }
    }

    async MonitorTrainingProcess(experiment_id, pid, log_path, epoch_count) {
        var last_epoch = 0;

        var state = {
            disabled: true
        }
        this.setState(state);

        var do_continue = true;
        // Initializa progress bar
        this.UpdateProgressBar("initializing", 100);

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

                    last_epoch = res.data.last_epoch;

                    if (last_epoch > 0) {
                        this.UpdateTrainingProgress(res.data);
                    }
                    console.log(last_epoch);

                    if (progress >= 100) {
                        // Finish monitoring when training is completed
                        do_continue = false;
                        this.UpdateProgressBar("completed", progress);
                    }

                    if (progress < 100 && res.data.alive == false) {
                        do_continue = false;
                        this.UpdateProgressBar("failed", progress);
                        alert("학습이 비정상 종료되었습니다. 모니터링이 중지됩니다");
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

                console.log(res);
                console.log(Object.keys(data));
                if (Object.keys(data).length == 0) {
                    alert("학습 개시를 실패했습니다");
                    return;
                }

                if (!("experiment_id" in data)) {
                    alert("Experiment_ID 를 상실했습니다");
                    return;
                }

                if (!("pid" in data)) {
                    alert("PID 를 상실했습니다");
                    return;
                }

                if (!("log_path" in data)) {
                    alert("Tensorboard log 경로를 상실했습니다");
                    return;
                }

                if (!("log_path" in data)) {
                    alert("Epoch_count 를 상실했습니다");
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
                    <Button disabled={this.state.disabled} className="btn btn-primary btn-sm w-15" onClick={() => { this.RunTrainingProcess() }}>학습 개시</Button>
                    <TrainingProgress className="w-85" style={{ height: 30, marginLeft: 5 }} now={this.state.progress} progress_label={this.state.progress_label} variant={this.state.style.variant} animated={this.state.style.animated} />
                </Form>
            </>
        );
    }
}

export default TR_67;