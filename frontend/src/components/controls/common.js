import React from "react";
import {
    InputGroup,
    Form,
    ProgressBar,
} from "react-bootstrap";

class TextInput extends React.Component{
    constructor(props) {
        super(props);
        this.name = props.props["name"];
        this.mt = props.props["mt"];
    }

    render() {
        return (
            <>
                <InputGroup style={{marginTop: this.mt}}>
                    <Form.Label className="w-25">{this.name}</Form.Label>
                    <Form.Control  type="text" />
                    <Form.Control className="invisible w-50" type="text" />
                </InputGroup>
            </>
        );
    }
}

class TrainingProgress extends React.Component{
    constructor(props) {
        super(props);
        this.progress = props.props["now"];
        this.className = props.className;
        this.style = props.style;
    }

    render() {
        return (
            <>
                <ProgressBar variant="success" className={this.className} style={this.style} animated now={this.progress} label={`${this.progress}%`} />
            </>
        );
    }
}

export default TextInput;
export {
    TrainingProgress,
};