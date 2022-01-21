import React from "react";
import { 
    InputGroup, 
    Button, 
    Form 
} from 'react-bootstrap';

class TR_1 extends React.Component{
    constructor(props) {
        super(props);
    }

    OpenDirectoryPicker() {
        console.log("Open modal dialog");
    }

    render() {
        return (
            <>
                <InputGroup>
                    <Button className="btn btn-primary btn-sm w-25" onClick={this.OpenDirectoryPicker}>데이터셋 열기</Button>
                    <Form.Control type="text"  />
                </InputGroup>
            </>
        );
    }
}

export default TR_1;