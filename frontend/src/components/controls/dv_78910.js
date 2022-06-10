import React from "react";
import {
    InputGroup,
    Form,
    Button,
} from "react-bootstrap";

import {
    DirectoryPicker,
    TableComponent,
} from "./common";

import config from 'react-global-configuration';
import axios from "axios";

import {
    DatasetContext
} from "../DatasetContext";

import {
    ProgressBar
} from 'react-bootstrap';

import { Type } from 'react-bootstrap-table2-editor';

class DV_78910 extends React.Component {
    static contextType = DatasetContext;

    constructor(props) {
        super(props);

        SetVideoCount = SetVideoCount.bind(this);
    }

    SetDatasetSeparationParameters(data) {
        if (this.context.DatasetState.video_path == "") {
            alert("Video path must be specified");
            return false;
        }
        data.append("video_path", this.context.DatasetState.video_path);

        // Check split rate correctness
        let train_rate = parseInt(this.context.DatasetState.train_rate);
        let val_rate = parseInt(this.context.DatasetState.validation_rate);
        let test_rate = parseInt(this.context.DatasetState.test_rate);

        if (train_rate <= 0) {
            alert("[ERROR] Train rate must be more than zero");
            return false;
        }

        if (val_rate < 0) {
            alert("ERROR] Validation rate must more or equal to zero");
            return false;
        }

        if (test_rate < 0) {
            alert("[ERROR] Test rate must be more or equal to zero");
            return false;
        }

        if (train_rate + val_rate + test_rate != this.context.DatasetState.video_count) {
            alert("[ERROR] train + validation + test rates must be equal to total video count");
            return false;
        }

        data.append("train_rate", train_rate);
        data.append("validation_rate", val_rate);
        data.append("test_rate", test_rate);

        data.append("shuffle", this.context.DatasetState.shuffle);

        // Check output path
        if (this.context.DatasetState.output_path == "") {
            alert("[ERROR] Output path must be specified");
            return false;
        }
        data.append("output_path", this.context.DatasetState.output_path);

        // Check correctness of augmentation parameters
        var val = parseFloat(this.state.content[0]["적용률"]);
        if (val < 0 || val > 100) {
            alert("[ERROR] Horizontal flipping must be in range [0, 100]");
            return false;
        }
        this.context.DatasetState.augmentation.horizontal_flipping = val;

        val = parseFloat(this.state.content[1]["적용률"]);
        if (val < 0 || val > 100) {
            alert("[ERROR] Vertical flipping must be in range [0, 100]");
            return false;
        }
        this.context.DatasetState.augmentation.vertical_flipping = val;

        val = parseFloat(this.state.content[2]["적용률"]);
        if (val < 0 || val > 100) {
            alert("[ERROR] Brigtness must be in range [0, 100]");
            return false;
        }
        this.context.DatasetState.augmentation.brightness = val;

        val = parseFloat(this.state.content[2]["비율"])
        if (val < 0) {
            alert("[ERROR] Brightness factor must be more or equal to than zero");
            return false;
        }
        this.context.DatasetState.augmentation.brightness_factor = val;

        val = parseFloat(this.state.content[3]["적용률"]);
        if (val < 0 || val > 100) {
            alert("[ERROR] Contrast must be in range [0, 100]");
            return false;
        }
        this.context.DatasetState.augmentation.contrast = val;

        val = parseFloat(this.state.content[3]["비율"]);
        if (val < 0) {
            alert("[ERROR] Contrast factor must be more or equal to zero");
            return false;
        }
        this.context.DatasetState.augmentation.contrast_factor = val;

        val = parseFloat(this.state.content[4]["적용률"]);
        if (val < 0 || val > 100) {
            alert("[ERROR] Scale factor must be in range [0, 100]");
            return false;
        }
        this.context.DatasetState.augmentation.scale = val;

        val = parseFloat(this.state.content[4]["비율"]);
        if (val < 0 || val > 10) {
            alert("[ERROR] Scale factor must be in range (0, 10]");
            return false;
        }
        this.context.DatasetState.augmentation.scale_factor = val;

        val = parseFloat(this.state.content[5]["적용률"]);
        if (val < 0 || val > 100) {
            alert("[ERROR] Rotate factor must be in range [0, 100]");
            return false;
        }
        this.context.DatasetState.augmentation.rotate = val;

        val = parseFloat(this.state.content[5]["비율"]);
        this.context.DatasetState.augmentation.rotate_factor = val;

        data.append("augmentation", JSON.stringify(this.context.DatasetState.augmentation));

        return true;
    }

    timeout(delay) {
        return new Promise(res => setTimeout(res, delay));
    }

    UpdateProgressBar = (type) => {
        var state = {
        }

        switch (type) {
            case "processing": {
                state.progress_variant = "success";
                state.run_button_disabled = true;
                state.animated = true;
                state.progress_label = "Processing";
                break;
            }
            case "completed": {
                state.progress_variant = "";
                state.run_button_disabled = false;
                state.animated = false;
                state.progress_label = "Completed";
                break;
            }
            case "failed": {
                state.progress_variant = "danger";
                state.run_button_disabled = false;
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

    async MonitoringDatasetSeparation(pid) {
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
                        req: "GET_DATASET_SEPARATION_STATUS",
                        pid: pid
                    }
                })
                .then((res) => {
                    if (res.data.alive == false) {
                        do_continue = false;
                        this.UpdateProgressBar("completed");
                        alert("[INFO]: Dataset separation completed");
                    }
                })
                .catch((err) => {
                    alert(err);
                    do_continue = false;
                    this.UpdateProgressBar("failed");
                })
        }
    }

    RunDatasetSeparation() {
        var url = config.get("django_url") + config.get("dataset_viewer_rest");
        let data = new FormData();

        var ret = this.SetDatasetSeparationParameters(data);
        if (ret == false) {
            return;
        }

        data.append("req", "RUN_DATASET_SEPARATION");

        axios
            .post(url, data)
            .then((res) => {
                if (res.data.status == "SUCCESS") {
                    this.MonitoringDatasetSeparation(res.data.pid);
                } else {
                    alert("[ERROR] Process failed to run on the server.");
                }
            })
            .catch((err) => alert(err))
    }

    RatioChangedHandler(e, rate_type) {
        if (rate_type == "train") {
            this.context.DatasetState.train_rate = e.target.value;
        } else if (rate_type == "validation") {
            this.context.DatasetState.validation_rate = e.target.value;
        } else if (rate_type == "test") {
            this.context.DatasetState.test_rate = e.target.value;
        }
    }

    HandleShuffleChange = (e) => {
        this.context.DatasetState.shuffle = !(this.context.DatasetState.shuffle)
    }

    HandleOutputDirectoryChange = (val) => {
        this.context.DatasetState.output_path = val;
    }

    state = {
        content: [
            {
                "함수": "Horizontal flipping",
                "적용률": 0,
                "비율": "-"
            },
            {
                "함수": "Vertical flipping",
                "적용률": 0,
                "비율": "-"
            },
            {
                "함수": "Brightness(jittering)",
                "적용률": 0,
                "비율": "1"
            },
            {
                "함수": "Contrast(jittering)",
                "적용률": 0,
                "비율": "1"
            },
            {
                "함수": "Scale",
                "적용률": 0,
                "비율": "1"
            },
            {
                "함수": "Rotate",
                "적용률": 0,
                "비율": "1"
            }
        ],
        columns: [
            {
                dataField: '함수',
                text: '함수'
            }, {
                dataField: '적용률',
                text: '적용률, %',
                type: 'number'
            }, {
                dataField: '비율',
                text: '비율',
                type: 'number'
            }
        ],
        progress_variant: "light",
        run_button_disabled: false,
        animated: false,
        progress_label: "",
        video_count: 0,
    }

    render() {
        let key_name = '함수';
        return (
            <>
                <h5><b>{`데이터셋 분리: ${this.state.video_count}개`}</b></h5>
                <InputGroup className="ratio-settings w-75 p-2 pb-0">
                    <Form.Label className="w-30" style={{ marginLeft: 5 }}>
                        학습:
                    </Form.Label>
                    <Form.Label className="w-30" style={{ marginLeft: 5 }}>
                        검증:
                    </Form.Label>
                    <Form.Label className="w-33" style={{ marginLeft: 5 }}>
                        테스트:
                    </Form.Label>
                </InputGroup>
                <InputGroup className="ratio-settings w-75 p-2 pt-0">
                    <Form.Control
                        style={{ marginRight: 5, marginLeft: 5 }}
                        size="sm"
                        type="number"
                        onChange={(event) => this.RatioChangedHandler(event, "train")}
                    />
                    <Form.Control
                        style={{ marginLeft: 5, marginRight: 5 }}
                        size="sm"
                        type="number"
                        onChange={(event) => this.RatioChangedHandler(event, "validation")}
                    />
                    <Form.Control
                        style={{ marginLeft: 5 }}
                        size="sm"
                        type="number"
                        onChange={(event) => this.RatioChangedHandler(event, "test")}
                    />
                </InputGroup>
                <InputGroup className="ratio-settings w-75 p-2">
                    <Form style={{ marginTop: 10 }}>
                        <Form.Check
                            type="switch"
                            id="custom-switch"
                            label="무작위 섞기"
                            onChange={this.HandleShuffleChange}
                        />
                    </Form>
                </InputGroup>

                <DirectoryPicker
                    style={{ marginTop: 10, marginBottom: 10 }}
                    name="출력 폴더"
                    addIcon="true"
                    canCreateDirectory={true}
                    onChange={this.HandleOutputDirectoryChange.bind(this)}
                />

                <h6>증강함수 적용</h6>
                <div style={{ height: 213, overflowY: "scroll" }}>
                    <TableComponent content={this.state.content} columns={this.state.columns} key_name={key_name} editable={true} />
                </div>
                <ProgressBar
                    style={{ marginTop: 10, height: "25px" }}
                    now={100}
                    variant={this.state.progress_variant}
                    animated={this.state.animated}
                    striped={this.state.animated}
                    label={this.state.progress_label}
                />

                <div style={{ textAlign: "right" }}>
                    <Button
                        style={{ marginTop: 10 }}
                        disabled={this.state.run_button_disabled}
                        variant="primary"
                        onClick={() => { this.RunDatasetSeparation() }}>실행</Button>
                </div>
            </>
        );
    }
}

function SetVideoCount(video_count) {
    var state = {
        video_count: video_count
    }

    this.setState(state);
}

export default DV_78910;
export {
    SetVideoCount,
}