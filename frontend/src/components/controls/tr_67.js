import React from "react";
import {
    TrainingProgress,
} from "./common";
import { 
    Button,
    Form,
    ProgressBar,
} from 'react-bootstrap';

class TR_67 extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <Form className='d-flex'>
                    <Button className="btn btn-primary btn-sm w-15">학습 개시</Button>
                    <TrainingProgress className="w-85" style={{height: 30, marginLeft: 5}} props={{now: 45}} />
                </Form>
            </>
        );
    }
}

export default TR_67;