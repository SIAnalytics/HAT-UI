import React from "react";
import { 
    Button, 
    Form, 
    InputGroup 
} from 'react-bootstrap';

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
            alert("Output directory must be specified");
            return;
        }
        var url = config.get("django_url") + "/training_helper/rest";

        let data = new FormData();
        data.append("req", "SAVE_MODEL_PARAMETERS");
        data.append("path", val);

        axios
            .post(url, data)
            .then((res) => {
                alert("Request successfully processed");
            })
            .catch((err) => {
                alert(err);
                console.log(err);
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