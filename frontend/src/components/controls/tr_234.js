import React from "react";
import { 
    Form, 
    Button, 
    InputGroup } from 'react-bootstrap';

class TR_234 extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <InputGroup>
                    <Form.Group className="w-100 d-flex">
                        <Form.Label className="w-25">모델 선택</Form.Label>
                        <Form.Select className="w-75" size="sm">
                            <option>모델 선택</option>
                            <option value="1">Model 1</option>
                            <option value="2">Model 2</option>
                            <option value="3">Model 3</option>
                            <option value="4">Model 4</option>
                        </Form.Select>
                    </Form.Group>
                </InputGroup>
                <InputGroup style={{marginTop: 10}}>
                    <Button className="btn btn-primary btn-sm w-25">모델 불러오기</Button>
                    <Form.Control type="text"  />
                </InputGroup>
                <InputGroup style={{marginTop: 10}}>
                   <Form>
                        <Form.Check 
                            type="switch"
                            id="custom-switch"
                            label="랜덤 초기화"
                        />
                    </Form>
                </InputGroup>
            </>
        );
    }
}

export default TR_234;