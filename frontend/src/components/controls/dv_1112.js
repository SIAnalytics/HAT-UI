import React from "react";

import {
    Form,
    ProgressBar,
} from 'react-bootstrap';

import {
    ConversionComponent
} from "./common"

import axios from "axios";

import {
    DatasetContext
} from "../DatasetContext";

import config from 'react-global-configuration';

class DV_1112 extends React.Component {
    static contextType = DatasetContext;
    constructor(props) {
        super(props);
    }

    state = {
        progress_variant: "light",
        animated: false,
        progress_label: ""
    }

    UpdateProgressBar = (type) => {
        var state = {
        }

        switch (type) {
            case "processing": {
                state.progress_variant = "success";
                state.animated = true;
                state.progress_label = "Processing";
                break;
            }
            case "completed": {
                state.progress_variant = "";
                state.animated = false;
                state.progress_label = "Completed";
                break;
            }
            case "failed": {
                state.progress_variant = "danger";
                state.animated = false;
                state.progress_label = "Failed";
                break;
            }
            default: {
                break;
            }
        }

        this.setState(state);
    }

    CheckConversionSupported(src, dst) {
        if (src == "MOT") {
            if (dst == "FairMOT") {
                return true;
            } else if (dst == "YOLOX COCO") {
                return true;
            } else if (dst == "EfficientDet COCO") {
                return true;
            }
        }

        return false;
    }

    timeout(delay) {
        return new Promise(res => setTimeout(res, delay));
    }

    async MonitorDatasetConversion(pid) {
        var do_continue = true;

        this.UpdateProgressBar("processing");

        while (do_continue) {
            await this.timeout(3000);

            if (do_continue == false) {
                break;
            }

            var url = config.get("django_url") + config.get("dataset_viewer_rest");

            axios
                .get(url, {
                    params: {
                        req: "GET_DATASET_CONVERSION_STATUS",
                        pid: pid
                    }
                })
                .then((res) => {
                    if (res.data.alive == false) {
                        do_continue = false;
                        this.UpdateProgressBar("completed");
                        alert("[INFO]: Dataset conversion completed");
                    }
                })
                .catch((err) => {
                    alert(err);
                    do_continue = false;
                    this.UpdateProgressBar("failed");
                })
        }
    }

    ProcessSave = (val) => {
        if (val == "") {
            alert("[ERROR] Path must be specified");
            return;
        }

        if (this.context.DatasetState.convert_to == "") {
            alert("[ERROR] TO field must be selected");
            return;
        }

        if (this.CheckConversionSupported("MOT", this.context.DatasetState.convert_to) == false) {
            alert("[ERROR] Selected conversion is not supported yet");
            return;
        }

        var url = config.get("django_url") + config.get("dataset_viewer_rest");
        axios
            .get(url, {
                params: {
                    "req": "CONVERT_DATASET",
                    "path": val,
                    "convert_from": "MOT",
                    "convert_to": this.context.DatasetState.convert_to,
                }
            })
            .then((res) => {
                if (res.data.status == "SUCCESS") {
                    this.MonitorDatasetConversion(res.data.pid);
                } else {
                    alert("[ERROR] Process failed to run on the server");
                }
            })
            .catch((err) => {
                alert("[ERROR]" + err);
            })
    }

    ToFieldChange = (e) => {
        this.context.DatasetState.convert_to = e.target.value;
    }

    render() {
        return (
            <>
                <h5><b>데이터셋 포맷 변환</b></h5>
                <Form.Group style={{ marginTop: 10 }} className="w-100 d-flex">
                    <Form.Select className="w-100" onChange={this.ToFieldChange.bind(this)}>
                        <option value="">To</option>
                        <option value="FairMOT">FairMOT</option>
                        <option value="YOLOX COCO">YOLOX COCO</option>
                        <option value="EfficientDet COCO">EfficientDet COCO</option>
                    </Form.Select>
                </Form.Group>
                <ConversionComponent style={{ marginTop: 10 }} ProcessSave={this.ProcessSave} buttonName="변환" />
                <ProgressBar
                    style={{ marginTop: 10, height: "25px" }}
                    now={100}
                    variant={this.state.progress_variant}
                    animated={this.state.animated}
                    striped={this.state.animated}
                    label={this.state.progress_label}
                />
            </>
        );
    }
}

export default DV_1112;