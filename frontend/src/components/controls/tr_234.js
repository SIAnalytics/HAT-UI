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

class TR_234 extends React.Component{
    constructor(props) {
        super(props);
    }

    state = {
        model_options: []
    }

    componentDidMount() {
        // Set models list
        var url = config.get("django_url") + "/training_helper/rest";

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
        var url = config.get("django_url") + "/training_helper/rest";

        axios
            .get(url, {
                params: {
                    req: "GET_MODEL_HYPERPARAMS",
                    model_name: model_name
                }
            })
            .then((res) => {
                var param_names = res.data;

                SetHyperParameters(param_names);
            })
            .catch((err) => alert(err));
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
                <DirectoryPicker style={{marginTop: 10}} name="모델 불러오기" />
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