import React from "react";

import {
    Form,
} from 'react-bootstrap';

import {
    ConversionComponent
} from "./common"

import axios from "axios";

import {
    DatasetContext
} from "../DatasetContext";

import config from 'react-global-configuration';

class DV_1112 extends React.Component{
    static contextType = DatasetContext;
    constructor(props) {
        super(props);
    }

    ProcessSave = (val) => {
        if (val == "") {
            alert("[ERROR] Path must be specified");
            return;
        }

        // Check to and from values
        if (this.context.DatasetState.convert_from == "") {
            alert("[ERROR] FROM field must be specified");
            return;
        }

        if (this.context.DatasetState.convert_to == "") {
            alert("[ERROR] TO field must be selected");
            return;
        }

        var url = config.get("django_url") + config.get("dataset_viewer_rest");
        axios
            .get(url, {
                params: {
                    "req": "CONVERT_DATASET",
                    "path": val,
                    "convert_from": this.context.DatasetState.convert_from,
                    "convert_to": this.context.DatasetState.convert_to
                }
            })
            .then((res) => {
                alert("Conversion request submitted");
            })
            .catch((err) => {
                alert("[ERROR]" + err);
            })
    }

    FromFieldChange = (e) => {
        this.context.DatasetState.convert_from = e.target.value;
    }

    ToFieldChange = (e) => {
        this.context.DatasetState.convert_to = e.target.value;
    }

    render() {
        return (
            <>
                <h5><b>데이터셋 포맷 변환</b></h5>
                <Form.Group style={{marginTop: 10}} className="w-100 d-flex">
                    <Form.Select className="w-50" onChange={this.FromFieldChange.bind(this)}>
                        <option value="">From</option>
                        <option value="TOI">TOI</option>
                        <option value="MOT">MOT</option>
                        <option value="FairMOT">FairMOT</option>
                        <option value="COCO">COCO</option>
                    </Form.Select>
                    <Form.Select className="w-50" onChange={this.ToFieldChange.bind(this)}>
                        <option value="">To</option>
                        <option value="TOI">TOI</option>
                        <option value="MOT">MOT</option>
                        <option value="FairMOT">FairMOT</option>
                        <option value="COCO">COCO</option>
                    </Form.Select>
                </Form.Group>
                <ConversionComponent style={{marginTop: 10}} ProcessSave={this.ProcessSave} buttonName="변환" />
            </>
        );
    }
}

export default DV_1112;