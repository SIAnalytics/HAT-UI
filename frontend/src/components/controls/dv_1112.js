import React from "react";

import {
    Form,
} from 'react-bootstrap';

import {
    ConversionComponent
} from "./common"

class DV_1112 extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <h5><b>데이터셋 포맷 변환</b></h5>
                <Form.Group style={{marginTop: 10}} className="w-100 d-flex">
                    <Form.Select className="w-50">
                        <option value="">From</option>
                        <option value="TOI">TOI</option>
                        <option value="MOT">MOT</option>
                        <option value="FairMOT">FairMOT</option>
                        <option value="COCO">COCO</option>
                    </Form.Select>
                    <Form.Select className="w-50">
                        <option value="">To</option>
                        <option value="TOI">TOI</option>
                        <option value="MOT">MOT</option>
                        <option value="FairMOT">FairMOT</option>
                        <option value="COCO">COCO</option>
                    </Form.Select>
                </Form.Group>
                <ConversionComponent style={{marginTop: 10}} buttonName="변환" />
            </>
        );
    }
}

export default DV_1112;