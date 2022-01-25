import React from "react";
import {
    InputGroup,
    Form,
} from "react-bootstrap";

import {
    DirectoryPicker,
    TableComponent,
} from "./common";

import { Type } from 'react-bootstrap-table2-editor';

class DV_78910 extends React.Component{
    constructor(props) {
        super(props);
    }



    render() {
        let content = [
            {
                "함수": "Horizontal flipping",
                "적용률": 50
            },
            {
                "함수": "Vertical flipping",
                "적용률": 0
            },
            {
                "함수": "Rotation",
                "적용률": 15
            },
            {
                "함수": "Color jittering",
                "적용률": 0.8
            },
        ];
        let columns = [
            {
                dataField: '함수',
                text: '함수'
            }, {
                dataField: '적용률',
                text: '적용률',
            }
        ];

        let key_name = '함수';
        return (
            <>
                <h5><b>데이터셋 분리</b></h5>
                <InputGroup className="ratio-settings w-50 p-2">
                    <Form.Label>학습 : 검증 : 테스트</Form.Label>
                    <Form.Control style={{marginRight: 5, marginLeft: 5}} size="sm" type="text"  />: 
                    <Form.Control style={{marginLeft: 5, marginRight: 5}} size="sm" type="text"  />: 
                    <Form.Control style={{marginLeft: 5}} size="sm" type="text"  />
                    <br></br>
                    <Form style={{marginTop: 10}}>
                        <Form.Check 
                            type="switch"
                            id="custom-switch"
                            label="무작위 섞기"
                        />
                    </Form>
                </InputGroup>

                <DirectoryPicker style={{marginTop: 10, marginBottom: 10}} name="출력 폴더" addIcon="true"/>
                
                <h6>증강함수 적용</h6>
                <div style={{height: 213, overflowY: "scroll"}}>
                    <TableComponent content={content} columns={columns} key_name = {key_name}/>
                </div>
            </>
        );
    }
}

export default DV_78910;