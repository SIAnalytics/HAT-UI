import React from "react";

import {
    InputGroup,
    Form,
    ProgressBar,
    Button, 
} from "react-bootstrap";

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

    OpenDirectoryPicker() {
        console.log("Open modal dialog");
    }

    render() {
        let button;

        if (this.addIcon == "true") {
            button = <Button className="btn btn-primary btn-sm w-25" onClick={this.OpenDirectoryPicker}><FontAwesomeIcon icon={faFolder} /> {this.name}</Button>     
        } else {
            button = <Button className="btn btn-primary btn-sm w-25" onClick={this.OpenDirectoryPicker}>{this.name}</Button>     
        }
    
        return (
            <>
                <InputGroup style={this.style}>
                    {button}
                    <Form.Control type="text"  />
                </InputGroup>
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

    render() {
        return (
            <>
                <InputGroup style={this.style}>
                    <Button className="btn btn-primary btn-sm w-15"><FontAwesomeIcon icon={faFolder} /> {this.buttonName}</Button>
                    <Form.Control type="text" style={{marginLeft: 5}} />
                    <Button className="btn-sm w-13" variant="outline-primary" style={{marginLeft: 5}}>저장</Button>
                </InputGroup>
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