import React from "react";
import TextInput from "./common";
import {
    InputGroup,
    Form,
} from "react-bootstrap";

class TR_5 extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <h5><b>하이퍼 파라미터 설정</b></h5>
                <InputGroup>
                <Form.Label className="w-25">기본 설정 사용</Form.Label>
                    <Form>
                        <Form.Check 
                            type="switch"
                            id="custom-switch"
                        />
                    </Form>
                </InputGroup>

                <TextInput props={{name: "Minibatch", mt: 0}} />
                <TextInput props={{name: "Epochs", mt: 10}} />
                <TextInput props={{name: "Learning rates", mt: 10}} />
                <TextInput props={{name: "검증 주기", mt: 10}} />
            </>
        );
    }
}

export default TR_5;