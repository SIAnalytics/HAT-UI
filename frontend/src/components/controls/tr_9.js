import React from "react";

import config from 'react-global-configuration';
import axios from "axios";

import {
    ProgressBar
} from 'react-bootstrap';

import {
    ConversionComponent
} from "./common"

class TR_9 extends React.Component{
    constructor(props) {
        super(props);
    }

    state = {
        download_progress: 0,
        style: {
            variant: "success",
            animated: true
        }
    }

    SetProgressSate(type, progress = 0) {
        var state = {
            style: {

            }
        };
        switch(type) {
            case "process": {
                state.download_progress = progress;
                state.style.variant = "success";
                state.style.animated = true;
                break;
            }
            case "completed": {
                state.download_progress = 100;
                state.style.variant = "";
                state.style.animated = false;
                break;
            }
            default: {
                break;
            }
        }

        this.setState(state);
    }

    ProcessSave = (val) => {
        // Check the directory
        if (val == "") {
            alert("[ERROR] Output directory must be specified");
            return;
        }
        var url = config.get("django_url") + config.get("training_helper_rest");

        let data = new FormData();
        data.append("req", "SAVE_MODEL_WEIGHTS");
        data.append("path", val);

        var fileDownload = require('js-file-download');

        axios
            .get(url, {
                params: {
                    "req": "SAVE_MODEL_WEIGHTS",
                    "path": val
                },
                responseType: 'blob',
                onDownloadProgress: (progressEvent) => {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total); // you can use this to show user percentage of file downloaded
                    if (percentCompleted == 100) {
                        this.SetProgressSate("completed");
                    } else {
                        this.SetProgressSate("process", percentCompleted);
                    }
                }
            })
            .then((res) => {
                fileDownload(res.data, 'weights.pth');
                alert("Request successfully processed");
            })
            .catch((err) => {
                alert("[ERROR]" + err);
            });
    }

    render() {
        return (
            <>
                <h5><b>파라미터 저장</b></h5>
                <ConversionComponent style={{marginTop: 10}} ProcessSave={this.ProcessSave} buttonName="출력폴더" />
                <ProgressBar 
                    style={{marginTop: 10, height: "25px"}} 
                    variant={this.state.style.variant} 
                    animated={this.state.style.animated} 
                    now={this.state.download_progress} 
                    label={`${this.state.download_progress}%`} />
            </>
        );
    }
}

export default TR_9;