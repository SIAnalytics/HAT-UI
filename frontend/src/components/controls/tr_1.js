import React from "react";

import {
    DirectoryPicker,
} from './common';

class TR_1 extends React.Component{
    constructor(props) {
        super(props);
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