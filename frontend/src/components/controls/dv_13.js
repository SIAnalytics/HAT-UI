import React from "react";
import {
    Form
} from "react-bootstrap";
import {
    LineChart,
    BarChart,
    PieChart
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
                    <PieChart label="클래스 분포" className="col-md-3"/>
                    <PieChart label="클래스 분포" className="col-md-3"/>
                    <LineChart  label="정답률" className="col-md-3"/>
                    <BarChart label="정확도" className="col-md-3"/>
                </Form>
            </>
        );
    }
}

export default DV_13;