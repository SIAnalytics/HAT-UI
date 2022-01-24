import React from "react";
import {
    Container, 
    Row,
} from "react-bootstrap";

function DatasetViewer() {
    return(
        <Container>
            <Row>
                <div className="col-md-6">
                    <div className="options-content">
                        
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="options-content">
                    
                    </div>
                    <br></br>
                    <div className="options-content">
                    
                    </div>
                </div>
            </Row>
            <Row>
                <div className="col-md-12">
                    <div className="options-content">
                    
                    </div>
                </div>
            </Row>
        </Container>
    );
}

export default DatasetViewer;