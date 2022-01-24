import React from "react";

import {
    ConversionComponent
} from "./common"

class DV_1112 extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <h5><b>데이터셋 포맷 변환</b></h5>
                <ConversionComponent buttonName="변환" />
            </>
        );
    }
}

export default DV_1112;