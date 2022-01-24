import React from "react";
import {
    Container, 
    Row,
} from "react-bootstrap";

import {
    DV_123456,
    DV_78910,
    DV_1112,
    DV_13,
} from "./controls";

function DatasetViewer() {
    return(
        <Container>
            <Row>
                <div className="col-md-6">
                    <div className="options-content">
                        <DV_123456 />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="options-content">
                        <DV_78910 />
                    </div>
                    <br></br>
                    <div className="options-content">
                        <DV_1112 />
                    </div>
                </div>
            </Row>
            <Row>
                <div className="col-md-12">
                    <div className="options-content">
                        <DV_13 />
                    </div>
                </div>
            </Row>
        </Container>
    );
}

export default DatasetViewer;