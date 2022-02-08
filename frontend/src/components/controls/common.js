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
        }
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
                            Save
                        </Button>
                        <Button variant="secondary" onClick={this.closeModal}>
                            Close
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
    }

    render() {
        return (
            <>
                <BootstrapTable 
                    keyField={this.key_name} 
                    data={this.content} 
                    columns={this.columns} 
                    hover
                    striped
                    condensed
                    className="table-component"/>
            </>
        );
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
                    <Button className="btn-sm w-13" variant="outline-primary" style={{marginLeft: 5}}>저장</Button>
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
                            Save
                        </Button>
                        <Button variant="secondary" onClick={this.closeModal}>
                            Close
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