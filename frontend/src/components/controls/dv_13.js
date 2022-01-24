import React from "react";
import {
    Form
} from "react-bootstrap";
import {
    LineChart,
    BarChart
} from "./charts"

class DV_13 extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <h5><b>데이터셋 통계</b></h5>
                <Form className='d-flex'>                    
                    <LineChart  label="정답률" className="col-md-3"/>
                    <BarChart label="정확도" className="col-md-3"/>                    
                </Form>
            </>
        );
    }
}

export default DV_13;