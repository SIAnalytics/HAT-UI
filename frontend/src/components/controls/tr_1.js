import React from "react";
import { 
    InputGroup, 
    Button, 
    Form 
} from 'react-bootstrap';

import {
    DirectoryPicker,
} from './common';

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
                <DirectoryPicker name="데이터셋 열기" />
            </>
        );
    }
}

export default TR_1;