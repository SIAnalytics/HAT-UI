import React from "react";
import { 
    Button, 
    Form, 
    InputGroup 
} from 'react-bootstrap';

import {
    ConversionComponent
} from "./common"

class TR_9 extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <h5><b>파라미터 저장</b></h5>
                <ConversionComponent style={{marginTop: 10}} buttonName="출력폴더" />
            </>
        );
    }
}

export default TR_9;