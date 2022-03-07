import axios from "axios";
import React from "react";
import { 
    Form, 
    Button, 
    InputGroup } from 'react-bootstrap';

import {
    DirectoryPicker,
} from './common';

import {
    SetHyperParameters,
} from './tr_5';

import config from 'react-global-configuration';
import { TrainerContext } from '../TrainerContext';

class TR_234 extends React.Component{
    static contextType = TrainerContext;

    constructor(props) {
        super(props);
    }

    state = {
        model_options: [],
        input_disabled: false
    }

    componentDidMount() {
        // Set models list
        var url = config.get("django_url") + config.get("training_helper_rest");

        axios
            .get(url, {
                params: {
                    req: "GET_MODELS_LIST"
                }
            })
            .then((res) => {
                var model_names = res.data;
                model_names.unshift({
                    "id": "-1",
                    "name": "모델 선택"
                });
                var model_set = model_names.map((model) => (<option value={model.name} key={model.id}>{model.name}</option>));
                this.setState({model_options: model_set});
            })
            .catch((err) => alert(err));
    }

    HandleModelChange(e) {
        var model_name = e.target.value;

        // Get Model hyperparameters
        var url = config.get("django_url") + config.get("training_helper_rest");

        axios
            .get(url, {
                params: {
                    req: "GET_MODEL_HYPERPARAMS",
                    model_name: model_name
                }
            })
            .then((res) => {
                var params_list = res.data;

                SetHyperParameters(params_list);
                this.context.TrainerState.model_name = model_name;
                this.context.TrainerState.hyper_parameters = params_list;
            })
            .catch((err) => alert(err));
    }

    onModelPathChange = (val) => {
        this.context.TrainerState.model_path = val;
    }

    HandleSwitchChange = (e) => {
        this.context.TrainerState.random_flag = !(this.context.TrainerState.random_flag);

        var state = {

        };
        if (this.context.TrainerState.random_flag) {
            state.input_disabled = true;
        } else {
            state.input_disabled = false;
        }

        this.setState(state);
    }

    render() {
        return (
            <>
                <InputGroup>
                    <Form.Group className="w-100 d-flex">
                        <Form.Label className="w-25">모델 선택</Form.Label>
                        <Form.Select className="w-75" size="sm" onChange={this.HandleModelChange.bind(this)}>
                            {this.state.model_options}
                        </Form.Select>
                    </Form.Group>
                </InputGroup>
                <DirectoryPicker onChange={this.onModelPathChange.bind(this)} input_disabled={this.state.input_disabled} style={{marginTop: 10}} name="모델 불러오기" />
                <InputGroup style={{marginTop: 10}}>
                   <Form>
                        <Form.Check 
                            type="switch"
                            id="custom-switch"
                            label="랜덤 초기화"
                            onChange={this.HandleSwitchChange}
                        />
                    </Form>
                </InputGroup>
            </>
        );
    }
}

export default TR_234;