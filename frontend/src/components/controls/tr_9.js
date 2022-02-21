import React from "react";

import config from 'react-global-configuration';
import axios from "axios";

import {
    ConversionComponent
} from "./common"

class TR_9 extends React.Component{
    constructor(props) {
        super(props);
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
            </>
        );
    }
}

export default TR_9;