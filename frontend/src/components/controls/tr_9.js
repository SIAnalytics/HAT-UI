import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-regular-svg-icons";
import { 
    Button, 
    Form, 
    InputGroup 
} from 'react-bootstrap';

class TR_9 extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <h5><b>파라미터 저장</b></h5>
                <InputGroup style={{marginTop: 10}}>
                    <Button className="btn btn-primary btn-sm w-15"><FontAwesomeIcon icon={faFolder} /> 출력폴더</Button>
                    <Form.Control type="text" style={{marginLeft: 5}} />
                    <Button className="btn-sm w-13" variant="outline-primary" style={{marginLeft: 5}}>저장</Button>
                </InputGroup>
            </>
        );
    }
}

export default TR_9;