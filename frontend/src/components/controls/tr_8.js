import React from "react";

import {
    Form,
    Button,
    ButtonGroup,
    InputGroup,
} from "react-bootstrap";

import {
    LineChart,
    BarChart,
} from "./charts";

class TR_8 extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <InputGroup>
                    <h5 className="col-md-6"><b>검증 성능 확인</b></h5>
                    <div className="col-md-3"></div>
                    <ButtonGroup className="col-md-3">
                        <Button variant="outline-secondary" className="btn-sm">1</Button>
                        <Button variant="outline-secondary" className="btn-sm">2</Button>
                        <Button variant="outline-secondary" className="btn-sm">3</Button>
                    </ButtonGroup>
                </InputGroup>

                <Form className='d-flex'>                    
                    <LineChart  label="정답률" className="col-md-6"/>
                    <BarChart label="정확도" className="col-md-6"/>                    
                </Form>
            </>
        );
    }
}

export default TR_8;