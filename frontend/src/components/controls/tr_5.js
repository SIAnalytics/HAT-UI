import React from "react";
import TextInput from "./common";
import {
    InputGroup,
    Form,
} from "react-bootstrap";

import { TrainerContext } from '../TrainerContext';

class TR_5 extends React.Component{
    static contextType = TrainerContext;

    constructor(props) {
        super(props);

        SetHyperParameters = SetHyperParameters.bind(this);
    }

    state = {
        hyper_params: []
    }

    HandleSwitchChange = (e) => {
        this.context.TrainerState.hyper_default_flag = !(this.context.TrainerState.hyper_default_flag);
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
                            onChange={this.HandleSwitchChange}
                        />
                    </Form>
                </InputGroup>

                <div style={{height: 200, overflowY: "scroll", marginTop: 10, padding: 5}} className="block-example border border-light">
                    {this.state.hyper_params}
                </div>
            </>
        );
    }
}

function SetHyperParameters(param_names) {
    var params_set = param_names.map((parameter) => (<TextInput key={parameter.name} parameter={parameter} props={{mt: 10}} type={parameter.type}/>));

    var state = {
        hyper_params: params_set
    }
    this.setState(state);
}

export default TR_5;
export {
    SetHyperParameters,
}