import React from "react";

import {
    InputGroup,
    Form,
    ProgressBar,
    Button, 
    Modal
} from "react-bootstrap";

import {
    DirectoryPickerDialog
} from "./DirectoryPickerDialog"

import BootstrapTable from 'react-bootstrap-table-next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-regular-svg-icons";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import cellEditFactory from 'react-bootstrap-table2-editor';

import { TrainerContext } from '../TrainerContext';

class TextInput extends React.Component{
    static contextType = TrainerContext;

    constructor(props) {
        super(props);
        this.name = props.parameter.name;
        this.value = props.parameter.value;
        this.mt = props.props["mt"];
    }

    state = {
        value: this.props.parameter.value
    }

    InputChangedHandler = (event) => {
        const new_value = event.target.value;
        
        var state = {
            value: new_value
        }
        
        this.setState(state);

        for (var i = 0; i < this.context.TrainerState.hyper_parameters.length; i++) {
            
            if (this.context.TrainerState.hyper_parameters[i].name == this.name) {
                this.context.TrainerState.hyper_parameters[i].value = new_value;
                break;
            }
        }
    }

    render() {
        return (
            <>
                <InputGroup style={{marginTop: this.mt}}>
                    <Form.Label className="w-50">{this.name}</Form.Label>
                    <Form.Control  
                        type="number" 
                        value={this.state.value} 
                        onChange={(event)=>this.InputChangedHandler(event)}
                    />
                    <Form.Control className="invisible w-15" type="text" />
                </InputGroup>
            </>
        );
    }
}

class TrainingProgress extends React.Component{
    constructor(props) {
        super(props);
        this.className = props.className;
        this.style = props.style;
    }

    state = {
        progress: 0
    }

    render() {
        return (
            <>
                <ProgressBar 
                    variant={this.props.variant} 
                    className={this.className} 
                    style={this.style} 
                    animated={this.props.animated} 
                    now={this.props.now} 
                    label={`${this.props.now}%`} />
            </>
        );
    }
}

class DirectoryPicker extends React.Component{
    constructor(props) {
        super(props);
        this.name = props["name"];
        this.style = props["style"];
        this.addIcon = props["addIcon"];
    }

    state = {
        isOpen: false,
        val: "",
        to_save: false
    };

    openModal = () => this.setState({ isOpen: true });

    closeModal = () => {
        this.setState({ to_save: false });
        this.setState({ isOpen: false });
    }

    saveAndClose = () => {
        this.setState({ to_save: true });
        this.setState({ isOpen: false });
    }

    // Function is called from DirectoryPickerDialog
    setPath = (new_path) => {
        if (this.state.to_save == true) {
            this.setState({val: new_path});
            this.props.onChange(new_path);
        }
    }

    getPath = () => {
        return this.state.val;
    }

    render() {
        let button;

        if (this.addIcon == "true") {
            button = <Button className="btn btn-primary btn-sm w-25" onClick={this.openModal}><FontAwesomeIcon icon={faFolder} /> {this.name}</Button>     
        } else {
            button = <Button className="btn btn-primary btn-sm w-25" onClick={this.openModal}>{this.name}</Button>     
        }
    
        return (
            <>
                <InputGroup style={this.style}>
                    {button}
                    <Form.Control type="text"  
                        value={this.state.val}
                        disabled
                        onChange={e => this.setState({ val: e.target.value })}
                    />
                </InputGroup>

                <Modal 
                    show={this.state.isOpen} 
                    onHide={this.closeModal}
                    aria-labelledby="contained-modal-title-vcenter"
                    size="lg"
                    centered>
                    
                    <Modal.Header closeButton>
                        <Modal.Title>경로를 선택</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <DirectoryPickerDialog setPath={this.setPath}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.saveAndClose}>
                            선택
                        </Button>
                        <Button variant="secondary" onClick={this.closeModal}>
                            취소
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
}

class TableComponent extends React.Component{
    constructor(props) {
        super(props);
        this.columns = props["columns"];
        this.content = props["content"];
        this.key_name = props["key_name"];
        this.editable = props["editable"];
    }

    render() {
        if (this.editable == true) {
            return (
                <>
                    <BootstrapTable 
                        keyField={this.key_name} 
                        data={this.props.content} 
                        columns={this.props.columns} 
                        hover
                        striped
                        condensed
                        className="table-component"
                        cellEdit={ 
                            cellEditFactory({ 
                                mode: 'click',
                                blurToSave: true,
                            })
                        }
                    />
                </>
            );
        } else {
            return (
                <>
                    <BootstrapTable 
                        keyField={this.key_name} 
                        data={this.props.content} 
                        columns={this.columns} 
                        hover
                        striped
                        condensed
                        className="table-component"
                    />
                </>
            );
        }
    }
}


class ConversionComponent extends React.Component{
    constructor(props) {
        super(props);
        this.buttonName = props["buttonName"];
        this.style = props["style"];
    }

    state = {
        isOpen: false,
        val: "",
        to_save: false
    };

    openModal = () => this.setState({ isOpen: true });

    closeModal = () => {
        this.setState({ to_save: false });
        this.setState({ isOpen: false });
    }

    saveAndClose = () => {
        this.setState({ to_save: true });
        this.setState({ isOpen: false });
    }

    // Function is called from DirectoryPickerDialog
    setPath = (new_path) => {
        if (this.state.to_save == true) {
            this.setState({val: new_path});
        }
    }

    render() {
        return (
            <>
                <InputGroup style={this.style}>
                    <Button className="btn btn-primary btn-sm w-15" onClick={this.openModal}><FontAwesomeIcon icon={faFolder} /> {this.buttonName}</Button>                    
                    <Form.Control type="text" 
                        style={{marginLeft: 5}} 
                        value={this.state.val}
                        onChange={e => this.setState({ val: e.target.value })}
                        />
                    <Button className="btn-sm w-13" variant="outline-primary" onClick={() => { this.props.ProcessSave(this.state.val) }} style={{marginLeft: 5}}>저장</Button>
                </InputGroup>                

                <Modal 
                    show={this.state.isOpen} 
                    onHide={this.closeModal}
                    aria-labelledby="contained-modal-title-vcenter"
                    size="lg"
                    centered>
                    
                    <Modal.Header closeButton>
                        <Modal.Title>Pick the directory</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <DirectoryPickerDialog setPath={this.setPath}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.saveAndClose}>
                            선택
                        </Button>
                        <Button variant="secondary" onClick={this.closeModal}>
                            취소
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

export default TextInput;
export {
    TrainingProgress,
    DirectoryPicker,
    TableComponent,
    ConversionComponent,
};